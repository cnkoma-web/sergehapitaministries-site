import type { ReactNode } from "react";

// V2 (Lot 7, 11/09) — coquille visuelle partagée par les 4 écrans réels du
// parcours de connexion (vérification e-mail, e-mail envoyé, mot de passe
// modifié, compte activé), reproduisant prototype-html/account-flow.js §
// .account-flow-shell/.account-flow-card. Purement présentationnelle —
// chaque page fournit son propre contenu (label, titre, corps).
export default function AccountFlowShell({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  return (
    <div className="v2-account-flow-page">
      <div className="v2-commerce-narrow v2-account-flow-shell">
        <section className="v2-account-flow-card">
          <div className="v2-account-flow-heading">
            <p className="v2-eyebrow light">
              <span /> {label}
            </p>
            <h1>{title}</h1>
          </div>
          <div className="v2-account-flow-body">{children}</div>
        </section>
      </div>
    </div>
  );
}
