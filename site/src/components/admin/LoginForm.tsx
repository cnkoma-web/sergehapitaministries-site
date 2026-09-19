"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/account/PasswordInput";
import TurnstileWidget from "@/components/security/TurnstileWidget";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!captchaToken) {
      setError("La vérification de sécurité est encore en cours. Réessayez dans un instant.");
      return;
    }
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken },
    });

    setLoading(false);

    if (signInError) {
      setCaptchaToken("");
      setCaptchaReset((value) => value + 1);
      setError("Identifiants incorrects, ou ce compte n'a pas accès à l'administration.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="admin-card">
      {error && <div className="admin-error">{error}</div>}
      <div className="admin-field" style={{ marginBottom: 16 }}>
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" required autoComplete="username" />
      </div>
      <div className="admin-field" style={{ marginBottom: 8 }}>
        <label htmlFor="password">Mot de passe</label>
        <PasswordInput id="password" name="password" required autoComplete="current-password" />
      </div>
      {/* Même compte, même flux Supabase Auth que le site public (retour du
          06/09) — pas de page "mot de passe oublié" distincte pour l'admin,
          celle du site public suffit (voir /auth/confirm pour la correction
          du lien de récupération lui-même). */}
      <a href="/compte/mot-de-passe-oublie" className="admin-forgot">
        Mot de passe oublié ?
      </a>
      <TurnstileWidget action="admin_signin" name={false} onToken={setCaptchaToken} resetSignal={captchaReset} />
      <button type="submit" className="admin-btn-primary" style={{ width: "100%" }} disabled={loading || !captchaToken}>
        {loading ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
