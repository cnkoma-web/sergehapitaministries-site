import type { Metadata } from "next";
import Link from "next/link";
import AccountFlowShell from "@/components/account/AccountFlowShell";

export const metadata: Metadata = {
  title: "Consultez votre messagerie | Serge Hapita Ministries",
  robots: { index: false, follow: false },
};

// V2 (Lot 7, 11/09) — atteinte après une demande de réinitialisation de
// mot de passe (voir ForgotPasswordForm.tsx). Remplace l'ancien message
// affiché en ligne sous le formulaire — vraie page, comme dans la
// maquette (décision prise avec Serge le 11/09).
export default function EmailEnvoyePage() {
  return (
    <AccountFlowShell label="Réinitialisation" title="Consultez votre messagerie.">
      <div className="v2-account-flow-status">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
        <div>
          <strong>Si un compte correspond à cette adresse, un e-mail a été envoyé.</strong>
          <p>Le message contient un lien unique permettant de créer un nouveau mot de passe.</p>
        </div>
      </div>
      <div className="v2-account-flow-links">
        <Link href="/compte/mot-de-passe-oublie">Renvoyer un lien</Link>
        <Link href="/compte">Retour à la connexion</Link>
      </div>
    </AccountFlowShell>
  );
}
