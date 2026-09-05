"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

// Confirmation "Enregistré" après un formulaire d'admin (retour du 05/09) —
// remplace la redirection automatique vers la liste après "Enregistrer" :
// l'action serveur redirige désormais vers CETTE MÊME page d'édition avec
// ?saved=1, ce composant affiche une confirmation brève puis nettoie l'URL
// (router.replace, pas de retour arrière ajouté à l'historique), pour que
// recharger la page ne réaffiche pas le message indéfiniment. Retour à la
// liste reste un choix manuel (lien "← Retour à la liste" déjà présent sur
// chaque écran d'édition), plus une conséquence automatique de
// l'enregistrement.
export default function SavedToast({ message = "Modifications enregistrées." }: { message?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Lu une seule fois, à l'état initial (retour du 05/09) — pas recalculé à
  // chaque rendu : sinon, dès que l'effet nettoie l'URL ci-dessous,
  // "?saved=1" disparaît et le message se refermerait aussitôt au lieu de
  // rester visible le temps annoncé.
  const [visible, setVisible] = useState(() => searchParams.get("saved") === "1");

  useEffect(() => {
    if (!visible) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("saved");
    const clean = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(clean, { scroll: false });
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;
  return (
    <div className="admin-saved-toast" role="status">
      {message}
    </div>
  );
}
