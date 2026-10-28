"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/account/PasswordInput";

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
    // V2 (Lot 7, 11/09) — vraie page intermédiaire (/compte/mot-de-passe-
    // modifie), comme la maquette, plutôt qu'un redirect direct vers
    // /mon-compte (décision prise avec Serge le 11/09).
    router.push("/compte/mot-de-passe-modifie");
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
    // .v2-account-flow-form (même correction que ForgotPasswordForm.tsx) +
    // liste des règles AJOUTÉE (§ <ul class="password-rules"> de la
    // maquette, entièrement absente jusqu'ici) + libellés/bouton alignés
    // sur le texte réel du gabarit.
    <form id="new-password-form" className="v2-account-flow-form" onSubmit={handleSubmit}>
      {error && <div className="admin-error">{error}</div>}
      <label htmlFor="new-password">Nouveau mot de passe</label>
      <PasswordInput id="new-password" name="password" required minLength={8} autoComplete="new-password" />
      <label htmlFor="new-password-confirm">Confirmation du mot de passe</label>
      <PasswordInput id="new-password-confirm" name="password_confirm" required minLength={8} autoComplete="new-password" />
      <ul className="v2-password-rules">
        <li>Au moins 8 caractères</li>
        <li>Les deux saisies doivent être identiques</li>
      </ul>
      <button type="submit" disabled={loading}>
        {loading ? "Enregistrement…" : "Enregistrer le mot de passe →"}
      </button>
    </form>
  );
}
