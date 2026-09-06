"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Cette page est atteinte via le lien envoyé par e-mail (resetPasswordForEmail),
// mais la session de récupération est désormais établie AVANT d'arriver ici —
// côté serveur, une seule fois, par /auth/confirm (retour du 06/09). Le jeton
// brut n'apparaît plus jamais dans cette URL : à ce stade, il ne reste qu'à
// vérifier qu'une session existe (cookies déjà posés par la redirection) et à
// l'utiliser pour updateUser(), jamais à retenter d'utiliser le jeton lui-même.
// Le double repli ci-dessous (onAuthStateChange + getSession) reste en place
// par prudence pour un éventuel lien déjà envoyé au format précédent, avant
// la mise à jour du gabarit d'e-mail côté Supabase.
function updatePasswordErrorMessage(code: string | undefined): string {
  switch (code) {
    case "weak_password":
      return "Ce mot de passe est trop simple — utilisez au moins 8 caractères variés.";
    case "same_password":
      return "Ce mot de passe est identique à l'ancien — choisissez-en un différent.";
    case "session_not_found":
    case "session_expired":
      return "Votre session a expiré. Redemandez un lien de réinitialisation.";
    default:
      return "Impossible de mettre à jour le mot de passe. Réessayez, ou redemandez un lien de réinitialisation.";
  }
}

export default function NewPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // Si la session de récupération est déjà active au montage (retour de cache).
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password"));
    const confirm = String(formData.get("password_confirm"));
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updatePasswordErrorMessage(updateError.code));
      return;
    }
    router.push("/mon-compte");
    router.refresh();
  }

  if (!ready) {
    return (
      <p style={{ textAlign: "center", color: "var(--ink-soft)", fontSize: 14 }}>
        Ouvrez cette page depuis le lien reçu par e-mail pour définir un nouveau mot de passe.
      </p>
    );
  }

  return (
    <form className="account-form" onSubmit={handleSubmit}>
      {error && <div className="admin-error">{error}</div>}
      <label className="field-label" htmlFor="new-password">
        Nouveau mot de passe *
      </label>
      <input id="new-password" name="password" type="password" required minLength={8} autoComplete="new-password" />
      <label className="field-label" htmlFor="new-password-confirm">
        Confirmer le mot de passe *
      </label>
      <input id="new-password-confirm" name="password_confirm" type="password" required minLength={8} autoComplete="new-password" />
      <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
        {loading ? "Enregistrement…" : "Enregistrer le nouveau mot de passe →"}
      </button>
    </form>
  );
}
