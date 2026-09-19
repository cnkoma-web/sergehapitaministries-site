"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { prepareAnonymousOrderTransfer } from "@/lib/orders/actions";

type SocialProvider = "google" | "facebook";

type SocialAuthButtonsProps = {
  enabled: Record<SocialProvider, boolean>;
};

export default function SocialAuthButtons({ enabled }: SocialAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startOAuth(provider: SocialProvider) {
    if (!enabled[provider] || loadingProvider) return;

    setError(null);
    setLoadingProvider(provider);

    try {
      // La session anonyme disparaîtra au retour du fournisseur OAuth. Sa
      // preuve reste brièvement dans un cookie HttpOnly afin de rattacher le
      // panier et les commandes au compte qui vient de se connecter.
      await prepareAnonymousOrderTransfer();

      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/mon-compte`,
        },
      });

      if (oauthError) throw oauthError;
    } catch (oauthError) {
      console.error(`[compte] Connexion ${provider} impossible :`, oauthError);
      setLoadingProvider(null);
      setError("La connexion sociale n’a pas pu démarrer. Réessayez dans un instant.");
    }
  }

  const unavailable = !enabled.google && !enabled.facebook;

  return (
    <>
      <div className="oauth-buttons">
        <button
          type="button"
          className="social-btn"
          disabled={!enabled.google || Boolean(loadingProvider)}
          aria-label="Continuer avec Google"
          title={!enabled.google ? "Activation en cours" : undefined}
          onClick={() => startOAuth("google")}
        >
          <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5Z" />
            <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.6 8.3 6.3 14.7Z" />
            <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.5 34.9 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.5 39.6 16.2 44 24 44Z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.6 5.6C41.6 36 44 30.5 44 24c0-1.2-.1-2.4-.4-3.5Z" />
          </svg>
          {loadingProvider === "google" ? "Connexion…" : "Google"}
        </button>
        <button
          type="button"
          className="social-btn"
          disabled={!enabled.facebook || Boolean(loadingProvider)}
          aria-label="Continuer avec Facebook"
          title={!enabled.facebook ? "Activation en cours" : undefined}
          onClick={() => startOAuth("facebook")}
        >
          <svg viewBox="0 0 32 32" width="18" height="18" aria-hidden="true">
            <circle cx="16" cy="16" r="16" fill="#1877F2" />
            <path fill="#fff" d="M18 11.5h2.2V8.3h-2.7c-3 0-4.2 1.7-4.2 4.2v2H11v3.2h2.3V27h3.4v-9.3h2.6l.4-3.2h-3V12c0-.3.1-.5.3-.5Z" />
          </svg>
          {loadingProvider === "facebook" ? "Connexion…" : "Facebook"}
        </button>
      </div>
      {unavailable && <p className="account-soon">Activation sécurisée de Google et Facebook en cours</p>}
      {error && <div className="admin-error oauth-error">{error}</div>}
    </>
  );
}
