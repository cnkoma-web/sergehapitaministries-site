import type { Metadata } from "next";
import NewPasswordForm from "@/components/account/NewPasswordForm";
import AccountFlowShell from "@/components/account/AccountFlowShell";

export const metadata: Metadata = {
  title: "Nouveau mot de passe | Serge Hapita Ministries",
  robots: { index: false, follow: false },
};

// V2 (retour du 11/09, Lot 7) — reproduit prototype-html/account-flow.js §
// template "/compte/nouveau-mot-de-passe" (même coquille .account-flow-*
// que les autres écrans du parcours). Le <div className="v2-compte-page">
// superflu (emprunté au Lot 5 pour le style .account-form) a été retiré :
// NewPasswordForm utilise désormais sa propre classe réelle
// .v2-account-flow-form (voir le composant).
export default function NewPasswordPage() {
  return (
    <AccountFlowShell label="Réinitialisation" title="Créez un nouveau mot de passe.">
      <p>Choisissez un mot de passe différent de l&apos;ancien et confirmez-le.</p>
      <NewPasswordForm />
    </AccountFlowShell>
  );
}
