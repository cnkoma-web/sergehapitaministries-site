import type { Metadata } from "next";
import Link from "next/link";
import AccountFlowShell from "@/components/account/AccountFlowShell";

export const metadata: Metadata = {
  title: "Mot de passe modifié | Serge Hapita Ministries",
  robots: { index: false, follow: false },
};

// V2 (Lot 7, 11/09) — atteinte après la mise à jour réussie du mot de
// passe (voir NewPasswordForm.tsx). Remplace l'ancien redirect direct vers
// /mon-compte — vraie page intermédiaire, comme dans la maquette (décision
// prise avec Serge le 11/09). "Se connecter" pointe vers /compte : la
// session de récupération reste déjà active à ce stade (updateUser ne
// l'invalide pas), donc /compte redirige lui-même aussitôt vers
// /mon-compte (voir compte/page.tsx) — jamais de double saisie du mot de
// passe qu'on vient de choisir.
export default function MotDePasseModifiePage() {
  return (
    <AccountFlowShell label="Réinitialisation terminée" title="Votre mot de passe a été modifié.">
      <div className="v2-account-flow-status">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 12.5 9 17l11-11" />
        </svg>
        <div>
          <strong>Vous pouvez vous reconnecter.</strong>
          <p>Utilisez désormais votre nouveau mot de passe pour accéder à votre espace personnel.</p>
        </div>
      </div>
      <div className="v2-account-flow-links">
        <Link href="/compte" className="v2-account-flow-primary">
          Se connecter →
        </Link>
      </div>
    </AccountFlowShell>
  );
}
