"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import SocialAuthButtons from "./SocialAuthButtons";

type Tab = "login" | "signup";

// Messages différenciés par code d'erreur Supabase Auth plutôt qu'un message
// générique unique — vérifié en conditions réelles (voir notes de vérification
// Phase 3) : "user_already_exists", "email_address_invalid",
// "over_email_send_rate_limit" sont les cas rencontrés en pratique.
function signupErrorMessage(code: string | undefined, fallbackMessage: string): string {
  switch (code) {
    case "user_already_exists":
      return "Un compte existe déjà avec cet e-mail.";
    case "email_address_invalid":
      return "Cette adresse e-mail n'est pas valide.";
    case "over_email_send_rate_limit":
      return "Trop de tentatives d'inscription en peu de temps. Réessayez dans quelques minutes.";
    case "weak_password":
      return "Ce mot de passe est trop simple — utilisez au moins 8 caractères variés.";
    default:
      return fallbackMessage || "Impossible de créer le compte. Réessayez dans un instant.";
  }
}

export default function AuthTabs({ initialTab }: { initialTab: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <>
      <div className="account-tabs" id="account-tabs">
        <button className={tab === "login" ? "active" : undefined} onClick={() => setTab("login")}>
          Se connecter
        </button>
        <button className={tab === "signup" ? "active" : undefined} onClick={() => setTab("signup")}>
          Créer un compte
        </button>
      </div>

      {tab === "login" ? <LoginForm /> : <SignupForm />}
    </>
  );
}

function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    });

    setLoading(false);
    if (signInError) {
      setError("E-mail ou mot de passe incorrect.");
      return;
    }
    router.push("/mon-compte");
    router.refresh();
  }

  return (
    <form className="account-form" onSubmit={handleSubmit}>
      <SocialAuthButtons />
      <div className="account-divider">ou par e-mail</div>

      {error && <div className="admin-error">{error}</div>}

      <label className="field-label" htmlFor="login-email">
        E-mail *
      </label>
      <input id="login-email" name="email" type="email" required autoComplete="username" />

      <label className="field-label" htmlFor="login-password">
        Mot de passe *
      </label>
      <input id="login-password" name="password" type="password" required autoComplete="current-password" />

      <a href="/compte/mot-de-passe-oublie" className="forgot">
        Mot de passe oublié ?
      </a>

      <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
        {loading ? "Connexion…" : "Se connecter →"}
      </button>
    </form>
  );
}

function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password"));
    const passwordConfirm = String(formData.get("password_confirm"));

    if (password !== passwordConfirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: String(formData.get("email")),
      password,
      options: {
        data: {
          first_name: String(formData.get("first_name")),
          last_name: String(formData.get("last_name")),
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signupErrorMessage(signUpError.code, signUpError.message));
      return;
    }

    if (data.session) {
      // Confirmation email désactivée sur ce projet Supabase : session immédiate.
      router.push("/mon-compte");
      router.refresh();
      return;
    }

    setSuccess("Compte créé ! Vérifiez votre boîte mail pour confirmer votre adresse avant de vous connecter.");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <form className="account-form" onSubmit={handleSubmit}>
      <SocialAuthButtons />
      <div className="account-divider">ou par e-mail</div>

      {error && <div className="admin-error">{error}</div>}
      {success && <div className="admin-error" style={{ background: "#E3F5E9", color: "#1F8A4C" }}>{success}</div>}

      <label className="field-label" htmlFor="signup-first-name">
        Prénom *
      </label>
      <input id="signup-first-name" name="first_name" type="text" required />

      <label className="field-label" htmlFor="signup-last-name">
        Nom *
      </label>
      <input id="signup-last-name" name="last_name" type="text" required />

      <label className="field-label" htmlFor="signup-email">
        E-mail *
      </label>
      <input id="signup-email" name="email" type="email" required autoComplete="username" />

      <label className="field-label" htmlFor="signup-password">
        Mot de passe *
      </label>
      <input id="signup-password" name="password" type="password" required minLength={8} autoComplete="new-password" />

      <label className="field-label" htmlFor="signup-password-confirm">
        Confirmer le mot de passe *
      </label>
      <input id="signup-password-confirm" name="password_confirm" type="password" required minLength={8} autoComplete="new-password" />

      <label className="consent">
        <input type="checkbox" required />
        <span>
          J&apos;accepte les <a href="/termes-et-conditions" style={{ color: "var(--purple)" }}>termes et conditions</a> et
          la <a href="/politique-de-confidentialite" style={{ color: "var(--purple)" }}>politique de confidentialité</a>.
        </span>
      </label>

      <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
        {loading ? "Création…" : "Créer mon compte →"}
      </button>
    </form>
  );
}
