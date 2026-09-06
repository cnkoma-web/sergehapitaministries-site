"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
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
    setSent(true);
  }

  if (sent) {
    return (
      <div className="admin-error" style={{ background: "#E3F5E9", color: "#1F8A4C" }}>
        Si un compte existe avec cette adresse, un e-mail de réinitialisation vient d&apos;être
        envoyé. Pensez à vérifier vos spams.
      </div>
    );
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
