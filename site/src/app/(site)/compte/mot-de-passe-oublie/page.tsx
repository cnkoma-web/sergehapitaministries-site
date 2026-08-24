import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/account/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Mot de passe oublié | Serge Hapita Ministries",
  robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
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
          <ForgotPasswordForm />
        </div>
      </section>
    </>
  );
}
