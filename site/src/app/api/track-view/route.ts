import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Une vue comptabilisée une seule fois par visiteur, par article, par jour
// (retour du 06/09) — remplace l'incrément inconditionnel à chaque rendu de
// page, qui comptait aussi les rechargements de vérification (Serge et
// Claude Code pendant les rounds de correction) comme de vraies vues.
//
// Le témoin est un cookie par article (24h), posé ici — jamais depuis un
// Server Component, qui ne peut pas écrire de cookie sortant (voir
// ViewTracker.tsx, qui appelle cette route au montage plutôt que
// d'incrémenter pendant le rendu serveur). C'est un signal côté navigateur,
// pas un identifiant fiable : un visiteur qui vide ses cookies ou navigue en
// privé sera recompté. Compromis assumé, largement suffisant pour ne plus
// fausser le chiffre lors des vérifications normales — aucune exigence
// d'anti-abus plus fort n'a été posée.
const VIEW_COOKIE_MAX_AGE = 60 * 60 * 24; // 24h

export async function POST(request: NextRequest) {
  let articleId: unknown;
  try {
    ({ articleId } = await request.json());
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (typeof articleId !== "string" || !articleId) {
    return NextResponse.json({ error: "invalid articleId" }, { status: 400 });
  }

  const cookieName = `sh_view_${articleId}`;
  if (request.cookies.get(cookieName)) {
    return NextResponse.json({ counted: false });
  }

  const supabase = await createClient();
  await supabase.rpc("increment_article_views", { article_id: articleId });

  const response = NextResponse.json({ counted: true });
  response.cookies.set(cookieName, "1", {
    maxAge: VIEW_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
