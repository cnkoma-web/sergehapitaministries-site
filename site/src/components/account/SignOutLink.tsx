"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Extrait de DashTabs.tsx (chantier /mon-compte, reprise) : la maquette
// (§ .dashboard-head a, "Se déconnecter →") place ce lien dans l'en-tête,
// jamais dans la barre d'onglets latérale où il vivait jusqu'ici — seule sa
// POSITION change, la fonction réelle (supabase.auth.signOut) est
// strictement identique.
export default function SignOutLink() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/compte");
      router.refresh();
    });
  }

  return (
    <button type="button" onClick={handleSignOut} disabled={isPending} className="v2-dashboard-signout">
      {isPending ? "Déconnexion…" : "Se déconnecter →"}
    </button>
  );
}
