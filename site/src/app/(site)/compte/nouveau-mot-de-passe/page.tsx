import type { Metadata } from "next";
import NewPasswordForm from "@/components/account/NewPasswordForm";

export const metadata: Metadata = {
  title: "Nouveau mot de passe | Serge Hapita Ministries",
  robots: { index: false, follow: false },
};

export default function NewPasswordPage() {
  return (
    <>
      <section className="util-hero">
        <div className="wrap">
          <h1>Nouveau mot de passe</h1>
          <p>Choisissez un nouveau mot de passe pour votre compte.</p>
        </div>
      </section>
      <section className="account-section">
        <div className="wrap">
          <NewPasswordForm />
        </div>
      </section>
    </>
  );
}
