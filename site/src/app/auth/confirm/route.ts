import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Confirmation des liens de réinitialisation de mot de passe envoyés par
// e-mail (retour du 06/09) — le gabarit "Reset Password" du tableau de bord
// Supabase (Authentication → Email Templates) doit pointer ici :
//
//   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/compte/nouveau-mot-de-passe
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
  const next = searchParams.get("next") || "/";

  const redirectTo = request.nextUrl.clone();
  redirectTo.search = "";

  if (tokenHash) {
    const supabase = await createClient();
    // Seul le type "recovery" est utilisé sur ce site pour l'instant
    // (mot de passe oublié) — jamais signup/magiclink/email_change, qui
    // n'ont pas besoin de ce détour serveur (voir audit dans le commit :
    // ces flux-là dépendent uniquement du Site URL, déjà corrigé).
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
    if (!error) {
      redirectTo.pathname = next;
      return NextResponse.redirect(redirectTo);
    }
  }

  // Jeton manquant, invalide, ou réellement expiré (à distinguer de l'ancien
  // faux positif) — retour vers "mot de passe oublié" avec un message
  // explicite, plutôt qu'une redirection silencieuse vers la racine.
  redirectTo.pathname = "/compte/mot-de-passe-oublie";
  redirectTo.searchParams.set("error", "expired");
  return NextResponse.redirect(redirectTo);
}
