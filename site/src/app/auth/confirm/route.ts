import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Confirmation des liens envoyés par e-mail (retour du 06/09, généralisé le
// 11/09 pour le Lot 7) — les gabarits Supabase (Authentication → Email
// Templates) doivent pointer ici :
//
//   Reset Password :
//   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/compte/nouveau-mot-de-passe
//
//   Confirm signup (retour du 11/09, Lot 7 — à mettre à jour par Serge dans
//   le tableau de bord Supabase pour que /compte/compte-active soit
//   réellement atteinte après un clic sur le lien de confirmation reçu) :
//   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/compte/compte-active
//
// Deux bugs corrigés d'un coup par ce changement :
//
// 1. Un lien déclenché manuellement depuis le tableau de bord Supabase (sans
//    passer par ForgotPasswordForm) n'a aucun moyen de préciser une page de
//    destination — il retombait sur l'URL racine du site (Site URL) par
//    défaut. "next" est désormais écrit en dur dans le gabarit lui-même :
//    peu importe qui déclenche l'envoi, la destination est toujours la
//    bonne.
//
// 2. Le jeton (token_hash) n'est échangé contre une session qu'UNE SEULE
//    FOIS, ici, côté serveur (verifyOtp) — la page /compte/nouveau-mot-de-
//    passe n'a ensuite qu'à lire cette session déjà établie (cookies),
//    jamais à retenter d'utiliser le jeton brut elle-même. L'ancien
//    fonctionnement laissait le navigateur tenter d'établir la session
//    directement depuis l'URL (fragment ou ?code=), une approche fragile
//    avec le client PKCE de @supabase/ssr — d'où le "lien expiré"
//    systématique constaté par Serge, y compris sur un jeton flambant neuf.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  // "recovery" par défaut (retour du 06/09) — repli inoffensif tant que le
  // gabarit "Confirm signup" de Supabase n'a pas encore été mis à jour par
  // Serge pour transmettre type=signup (voir le commentaire en tête de
  // fichier, Lot 7) : un lien déjà envoyé au format précédent continue de
  // fonctionner exactement comme avant.
  const type = (searchParams.get("type") as EmailOtpType | null) || "recovery";
  const next = searchParams.get("next") || "/";

  const redirectTo = request.nextUrl.clone();
  redirectTo.search = "";

  if (tokenHash) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      redirectTo.pathname = next;
      return NextResponse.redirect(redirectTo);
    }
  }

  // Jeton manquant, invalide, ou réellement expiré (à distinguer de l'ancien
  // faux positif) — retour vers l'écran de demande le plus pertinent selon
  // le type de lien, avec un message explicite, plutôt qu'une redirection
  // silencieuse vers la racine.
  redirectTo.pathname = type === "signup" ? "/compte" : "/compte/mot-de-passe-oublie";
  redirectTo.searchParams.set("error", "expired");
  return NextResponse.redirect(redirectTo);
}
