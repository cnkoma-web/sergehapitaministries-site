"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ProfileForm from "./ProfileForm";

type Section = "apercu" | "commandes" | "profil" | "acces" | "avis";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "apercu", label: "Aperçu" },
  { id: "commandes", label: "Mes commandes" },
  { id: "profil", label: "Mon profil" },
  { id: "acces", label: "Mon accès" },
  { id: "avis", label: "Mes avis" },
];

type Props = {
  userId: string;
  firstName: string;
  email: string;
};

export default function DashTabs({ userId, firstName, email }: Props) {
  const [section, setSection] = useState<Section>("apercu");
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/compte");
    router.refresh();
  }

  return (
    <div className="wrap dash-layout">
      <nav className="dash-nav">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href="#"
            className={section === s.id ? "active" : undefined}
            onClick={(e) => {
              e.preventDefault();
              setSection(s.id);
            }}
          >
            {s.label}
          </a>
        ))}
        <button onClick={handleSignOut}>Se déconnecter</button>
      </nav>

      <div>
        {section === "apercu" && (
          <div className="dash-section active">
            <div className="dash-welcome">
              <p>
                Bonjour <strong>{firstName || email}</strong>, ravis de vous revoir.
              </p>
            </div>
            <h2>Aperçu</h2>
            <p className="empty-state">
              Aucune commande récente. Découvrez les{" "}
              <a href="/livres" style={{ color: "var(--purple)" }}>
                livres
              </a>{" "}
              ou la{" "}
              <a href="/boutique" style={{ color: "var(--purple)" }}>
                boutique
              </a>
              .
            </p>
          </div>
        )}

        {section === "commandes" && (
          <div className="dash-section active">
            <h2>Mes commandes</h2>
            <p className="empty-state">
              Vous n&apos;avez pas encore de commande. Vos achats de livres et de goodies
              apparaîtront ici.
            </p>
          </div>
        )}

        {section === "profil" && (
          <div className="dash-section active">
            <h2>Mon profil</h2>
            <ProfileForm userId={userId} initialFirstName={firstName} initialEmail={email} />
          </div>
        )}

        {section === "acces" && (
          <div className="dash-section active">
            <h2>Mon accès</h2>
            <p className="empty-state">
              Vous n&apos;avez pas encore d&apos;enseignement La Vie Supérieure débloqué. Les
              articles auxquels vous aurez accès apparaîtront ici.
            </p>
          </div>
        )}

        {section === "avis" && (
          <div className="dash-section active">
            <h2>Mes avis</h2>
            <p className="empty-state">Vous n&apos;avez publié aucun avis pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
