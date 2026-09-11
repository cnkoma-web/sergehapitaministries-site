"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const email = String(new FormData(e.currentTarget).get("email"));
    const supabase = createClient();
    // La vraie destination est désormais écrite en dur dans le gabarit
    // "Reset Password" du tableau de bord Supabase (voir
    // src/app/auth/confirm/route.ts, retour du 06/09) — ce qui garantit
    // qu'un lien déclenché manuellement depuis le tableau de bord atterrit
    // aussi au bon endroit, pas seulement ceux envoyés depuis ce formulaire.
    // `redirectTo` reste passé ici par sécurité (repli inoffensif si le
    // gabarit n'a pas encore été mis à jour), mais n'est plus ce qui pilote
    // le comportement réel.
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/compte/nouveau-mot-de-passe`,
    });

    setLoading(false);
    if (resetError) {
      setError("Impossible d'envoyer l'e-mail pour le moment. Réessayez plus tard.");
      return;
    }
    // V2 (Lot 7, 11/09) — vraie page dédiée (/compte/email-envoye), comme
    // la maquette, plutôt qu'un message affiché en ligne sous le formulaire
    // (décision prise avec Serge le 11/09).
    router.push("/compte/email-envoye");
  }

  return (
    <form className="account-form" onSubmit={handleSubmit}>
      {error && <div className="admin-error">{error}</div>}
      <label className="field-label" htmlFor="forgot-email">
        E-mail *
      </label>
      <input id="forgot-email" name="email" type="email" required autoComplete="username" />
      <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
        {loading ? "Envoi…" : "Envoyer le lien de réinitialisation →"}
      </button>
    </form>
  );
}
