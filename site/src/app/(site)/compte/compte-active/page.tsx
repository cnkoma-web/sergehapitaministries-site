import type { Metadata } from "next";
import Link from "next/link";
import AccountFlowShell from "@/components/account/AccountFlowShell";

export const metadata: Metadata = {
  title: "Compte activé | Serge Hapita Ministries",
  robots: { index: false, follow: false },
};

// V2 (Lot 7, 11/09) — atteinte après confirmation de l'adresse e-mail à
// l'inscription. Vraie page, comme dans la maquette (décision prise avec
// Serge le 11/09) — mais nécessite une action de Serge dans le tableau de
// bord Supabase pour être réellement atteinte : le gabarit "Confirm
// signup" (Authentication → Email Templates) doit être mis à jour pour
// pointer vers /auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/compte/compte-active
// (voir le commentaire détaillé dans auth/confirm/route.ts) — sans cette
// mise à jour, le lien de confirmation continue de fonctionner comme
// avant, il n'atterrit simplement pas ici.
export default function CompteActivePage() {
  return (
    <AccountFlowShell label="Compte activé" title="Votre adresse e-mail est confirmée.">
      <div className="v2-account-flow-status">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 12.5 9 17l11-11" />
        </svg>
        <div>
          <strong>Votre espace est prêt.</strong>
          <p>Vous pouvez maintenant vous connecter et retrouver vos commandes, vos accès et vos avis.</p>
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
