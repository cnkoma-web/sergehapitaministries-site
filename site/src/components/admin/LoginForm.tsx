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
      setError("Terminez la vérification de sécurité avant de vous connecter.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const email = String(formData.get("email"));
      const password = String(formData.get("password"));
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: { captchaToken },
      });

      if (signInError) {
        setCaptchaToken("");
        setCaptchaReset((value) => value + 1);
        setError("Identifiants incorrects, ou ce compte n’a pas accès à l’administration.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch (signInFailure) {
      console.error("[admin] Connexion impossible :", signInFailure);
      setCaptchaToken("");
      setCaptchaReset((value) => value + 1);
      setError("La connexion n’a pas pu aboutir. Vérifiez votre réseau puis réessayez.");
    } finally {
      setLoading(false);
    }
  }

  const securityMessage = captchaToken
    ? "Vérification de sécurité terminée."
    : "Effectuez la vérification de sécurité ci-dessus.";

  return (
    <form onSubmit={handleSubmit} className="admin-card" aria-busy={loading}>
      {error && (
        <div className="admin-error" role="alert">
          {error}
        </div>
      )}
      <div className="admin-field" style={{ marginBottom: 16 }}>
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" required autoComplete="username" inputMode="email" />
      </div>
      <div className="admin-field" style={{ marginBottom: 8 }}>
        <label htmlFor="password">Mot de passe</label>
        <PasswordInput id="password" name="password" required autoComplete="current-password" />
      </div>
      <a href="/compte/mot-de-passe-oublie" className="admin-forgot">
        Mot de passe oublié ?
      </a>
      <TurnstileWidget
        action="admin_signin"
        mode="interactive"
        name={false}
        onError={() => setError("La vérification de sécurité a échoué. Actualisez la page puis réessayez.")}
        onToken={(token) => {
          setCaptchaToken(token);
          if (token) setError(null);
        }}
        resetSignal={captchaReset}
      />
      <p id="admin-security-status" aria-live="polite" style={{ margin: "12px 0", fontSize: 14 }}>
        {securityMessage}
      </p>
      <button
        type="submit"
        className="admin-btn-primary"
        style={{ width: "100%" }}
        disabled={loading}
        aria-describedby="admin-security-status"
      >
        {loading ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
