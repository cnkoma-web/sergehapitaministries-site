import type { Metadata } from "next";
import Link from "next/link";
import AccountFlowShell from "@/components/account/AccountFlowShell";

export const metadata: Metadata = {
  title: "Vérifiez votre messagerie | Serge Hapita Ministries",
  robots: { index: false, follow: false },
};

// V2 (Lot 7, 11/09) — atteinte après une inscription qui nécessite une
// confirmation par e-mail (voir SignupForm dans AuthTabs.tsx). Remplace
// l'ancien message affiché en ligne sous le formulaire — vraie page, comme
// dans la maquette (décision prise avec Serge le 11/09).
export default function VerificationEmailPage() {
  return (
    <AccountFlowShell label="Création du compte" title="Vérifiez votre messagerie.">
      <div className="v2-account-flow-status">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
        <div>
          <strong>L&apos;e-mail de vérification a été envoyé.</strong>
          <p>Ouvrez le message reçu et cliquez sur le lien pour activer votre compte.</p>
        </div>
      </div>
      <div className="v2-account-flow-links">
        <Link href="/compte">Revenir à la connexion</Link>
      </div>
    </AccountFlowShell>
  );
}
