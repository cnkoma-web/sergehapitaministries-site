"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { linkPreparedAnonymousOrdersToCurrentAccount, prepareAnonymousOrderTransfer } from "@/lib/orders/actions";
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

type SocialProviders = { google: boolean; facebook: boolean };

function PasswordField({
  id,
  name,
  autoComplete,
  minLength,
}: {
  id: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-field">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        required
        minLength={minLength}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="password-toggle"
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-pressed={visible}
        title={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        onClick={() => setVisible((current) => !current)}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
          <circle cx="12" cy="12" r="2.7" />
          {visible && <path d="m4 4 16 16" />}
        </svg>
      </button>
    </div>
  );
}

export default function AuthTabs({
  initialTab,
  socialProviders,
  oauthError,
}: {
  initialTab: Tab;
  socialProviders: SocialProviders;
  oauthError?: boolean;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <>
      {/* role="tablist"/"tab"/aria-selected/aria-controls AJOUTÉS (chantier
          Compte, reprise) : § .account-tabs button[role="tab"][aria-
          selected] de la maquette — style déjà identique (grid 2 colonnes,
          filet violet), mais la sémantique ARIA du vrai panneau d'onglets
          manquait entièrement. */}
      <div className="account-tabs" id="account-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "login"}
          aria-controls="login-pane"
          className={tab === "login" ? "active" : undefined}
          onClick={() => setTab("login")}
        >
          Se connecter
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "signup"}
          aria-controls="signup-pane"
          className={tab === "signup" ? "active" : undefined}
          onClick={() => setTab("signup")}
        >
          Créer un compte
        </button>
      </div>

      {tab === "login" ? (
        <LoginForm socialProviders={socialProviders} oauthError={oauthError} />
      ) : (
        <SignupForm socialProviders={socialProviders} />
      )}
    </>
  );
}

function LoginForm({ socialProviders, oauthError }: { socialProviders: SocialProviders; oauthError?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(
    oauthError ? "La connexion sociale n’a pas abouti. Réessayez ou utilisez votre adresse e-mail." : null
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    try {
      await prepareAnonymousOrderTransfer();
    } catch (transferPreparationError) {
      console.error("[compte] Préparation des données anonymes impossible :", transferPreparationError);
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    });

    if (signInError) {
      setLoading(false);
      setError("E-mail ou mot de passe incorrect.");
      return;
    }

    try {
      const orderLinkResult = await linkPreparedAnonymousOrdersToCurrentAccount();
      if (orderLinkResult.error) {
        setLoading(false);
        setError("La connexion a réussi, mais votre commande n'a pas encore pu être rattachée. Réessayez une fois.");
        return;
      }

      setLoading(false);
      router.push(orderLinkResult.linked > 0 ? "/mon-compte?section=commandes" : "/mon-compte");
      router.refresh();
    } catch (transferError) {
      console.error("[compte] Rattachement après connexion impossible :", transferError);
      setLoading(false);
      setError("La connexion a réussi, mais votre commande n'a pas encore pu être rattachée. Réessayez une fois.");
    }
  }

  return (
    <form id="login-pane" role="tabpanel" aria-label="Se connecter" className="account-form" onSubmit={handleSubmit}>
      {error && <div className="admin-error">{error}</div>}

      <label className="field-label" htmlFor="login-email">
        E-mail *
      </label>
      <input id="login-email" name="email" type="email" required autoComplete="username" />

      <label className="field-label" htmlFor="login-password">
        Mot de passe *
      </label>
      <PasswordField id="login-password" name="password" autoComplete="current-password" />

      <a href="/compte/mot-de-passe-oublie" className="forgot">
        Mot de passe oublié ?
      </a>

      <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
        {loading ? "Connexion…" : "Se connecter →"}
      </button>

      <div className="oauth-choice">
        <div className="account-divider">
          <span>ou continuer avec</span>
        </div>
        <SocialAuthButtons enabled={socialProviders} />
      </div>
    </form>
  );
}

function SignupForm({ socialProviders }: { socialProviders: SocialProviders }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password"));
    const passwordConfirm = String(formData.get("password_confirm"));

    if (password !== passwordConfirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const email = String(formData.get("email"));
    const first_name = String(formData.get("first_name")).trim();
    const last_name = String(formData.get("last_name")).trim();

    const {
      data: { session: existingSession },
    } = await supabase.auth.getSession();

    // Un visiteur non connecté a déjà une session anonyme (CartSessionBootstrap,
    // Phase 5) : on la convertit en compte permanent plutôt que d'en créer un
    // nouveau, pour que son panier le suive automatiquement — même identifiant
    // technique conservé de bout en bout.
    const isAnonymousUpgrade = existingSession?.user?.is_anonymous === true;

    const { data, error: signUpError } = isAnonymousUpgrade
      ? await supabase.auth.updateUser({ email, password, data: { first_name, last_name } })
      : await supabase.auth.signUp({ email, password, options: { data: { first_name, last_name } } });

    if (signUpError) {
      setLoading(false);
      setError(signupErrorMessage(signUpError.code, signUpError.message));
      return;
    }

    // La conversion d'une session anonyme conserve le même utilisateur : le
    // trigger de création ne se relance donc pas. On synchronise explicitement
    // le profil maintenant que les noms ont été fournis.
    if (isAnonymousUpgrade && data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ first_name, last_name })
        .eq("id", data.user.id);

      if (profileError) {
        console.error("[compte] Profil non synchronisé après conversion anonyme :", profileError.message);
      }
    }

    setLoading(false);

    // Upgrade anonyme : la session existante reste valide immédiatement (même si
    // l'e-mail doit encore être confirmé) — inscription classique : une session
    // n'est renvoyée que si la confirmation par e-mail est désactivée.
    const hasImmediateSession = isAnonymousUpgrade || ("session" in data && Boolean(data.session));
    if (hasImmediateSession) {
      router.push("/mon-compte");
      router.refresh();
      return;
    }

    // V2 (Lot 7, 11/09) — vraie page dédiée (/compte/verification-email),
    // comme la maquette, plutôt qu'un message affiché en ligne sous le
    // formulaire (décision prise avec Serge le 11/09).
    router.push(`/compte/verification-email?email=${encodeURIComponent(email)}`);
  }

  return (
    <form id="signup-pane" role="tabpanel" aria-label="Créer un compte" className="account-form" onSubmit={handleSubmit}>
      {error && <div className="admin-error">{error}</div>}

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
      <PasswordField id="signup-password" name="password" minLength={8} autoComplete="new-password" />

      <label className="field-label" htmlFor="signup-password-confirm">
        Confirmer le mot de passe *
      </label>
      <PasswordField id="signup-password-confirm" name="password_confirm" minLength={8} autoComplete="new-password" />

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

      <div className="oauth-choice">
        <div className="account-divider">
          <span>ou continuer avec</span>
        </div>
        <SocialAuthButtons enabled={socialProviders} />
      </div>
    </form>
  );
}
