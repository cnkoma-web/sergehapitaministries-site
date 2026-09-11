import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/account/ForgotPasswordForm";
import AccountFlowShell from "@/components/account/AccountFlowShell";

export const metadata: Metadata = {
  title: "Mot de passe oublié | Serge Hapita Ministries",
  robots: { index: false, follow: true },
};

// V2 (retour du 11/09, Lot 7) — reproduit prototype-html/account-flow.js §
// template "/compte/mot-de-passe-oublie" (même coquille .account-flow-*
// que verification-email/email-envoye/mot-de-passe-modifie/compte-active).
// .v2-compte-page en plus de AccountFlowShell : réutilise le style déjà
// posé au Lot 5 pour .account-form (ForgotPasswordForm).
export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="v2-compte-page">
      <AccountFlowShell label="Accès au compte" title="Mot de passe oublié ?">
        <p>Indiquez l&apos;adresse e-mail associée à votre compte. Vous recevrez un lien pour choisir un nouveau mot de passe.</p>
        {/* Retour depuis /auth/confirm quand le jeton du lien reçu est
            invalide ou réellement expiré (retour du 06/09) — jamais
            affiché en cas de succès, seulement sur un vrai échec. */}
        {error === "expired" && (
          <div className="admin-error" style={{ marginBottom: 16 }}>
            Ce lien de réinitialisation est invalide ou a expiré. Demandez-en un nouveau ci-dessous.
          </div>
        )}
        <ForgotPasswordForm />
        <div className="v2-account-flow-links">
          <a href="/compte">Retour à la connexion</a>
        </div>
      </AccountFlowShell>
    </div>
  );
}
