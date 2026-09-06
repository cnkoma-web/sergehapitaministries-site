import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/account/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Mot de passe oublié | Serge Hapita Ministries",
  robots: { index: false, follow: true },
};

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <>
      <section className="util-hero">
        <div className="wrap">
          <h1>Mot de passe oublié</h1>
          <p>Indiquez votre e-mail, nous vous envoyons un lien pour en choisir un nouveau.</p>
        </div>
      </section>
      <section className="account-section">
        <div className="wrap">
          {/* Retour depuis /auth/confirm quand le jeton du lien reçu est
              invalide ou réellement expiré (retour du 06/09) — jamais
              affiché en cas de succès, seulement sur un vrai échec. */}
          {error === "expired" && (
            <div className="admin-error" style={{ maxWidth: 420, margin: "0 auto 24px" }}>
              Ce lien de réinitialisation est invalide ou a expiré. Demandez-en un nouveau ci-dessous.
            </div>
          )}
          <ForgotPasswordForm />
        </div>
      </section>
    </>
  );
}
