import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isRealUser } from "@/lib/supabase/realUser";
import AuthTabs from "@/components/account/AuthTabs";

const title = "Mon compte | Serge Hapita Ministries";
const description = "Connectez-vous ou créez un compte Serge Hapita Ministries.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/compte" },
  robots: { index: false, follow: true },
};

export default async function ComptePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (isRealUser(user)) redirect("/mon-compte");

  const { tab } = await searchParams;
  const initialTab = tab === "signup" ? "signup" : "login";

  return (
    // V2 (retour du 11/09, Lot 5) — reproduit prototype-html/compte/
    // index.html § .account-card/.account-aside/.account-form-area
    // (commerce.css). Réhabillage visuel uniquement : AuthTabs (connexion/
    // inscription réelles) inchangé. Boutons Google/Facebook (déjà réels
    // dans SocialAuthButtons, volontairement désactivés — voir ce fichier :
    // aucune app OAuth créée côté Google/Meta) conservés désactivés, jamais
    // rendus comme s'ils fonctionnaient.
    <div className="v2-compte-page">
      <section className="account-section">
        <div className="v2-commerce-narrow">
          <div className="account-card">
            <div className="account-aside">
              <p className="v2-eyebrow light">
                <span /> Espace personnel
              </p>
              <h1>Votre cheminement, réuni au même endroit.</h1>
              <p>Retrouvez vos commandes, votre profil, vos accès et les avis que vous avez transmis.</p>
              <div className="account-points">
                <span>
                  <b>01</b>Suivre vos commandes
                </span>
                <span>
                  <b>02</b>Gérer vos informations
                </span>
                <span>
                  <b>03</b>Retrouver vos avis
                </span>
              </div>
            </div>
            <div className="account-form-area">
              <AuthTabs initialTab={initialTab} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
