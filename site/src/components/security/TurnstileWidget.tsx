"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000BB";

type TurnstileMode = "invisible" | "interactive";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      size: "invisible" | "flexible";
      execution: "execute" | "render";
      appearance?: "always";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => boolean;
    }
  ) => string;
  execute: (widgetId: string) => void;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type Props = {
  action: string;
  mode?: TurnstileMode;
  name?: string | false;
  onError?: () => void;
  onToken?: (token: string) => void;
  resetSignal?: number;
};

/**
 * Widget Turnstile partagé par les formulaires et Supabase Auth.
 * Il reste invisible par défaut. Le mode interactif rend le contrôle visible
 * pour les parcours où l'utilisateur doit toujours pouvoir terminer le défi.
 * La clé factice officielle Cloudflare est réservée au développement local.
 */
export default function TurnstileWidget({
  action,
  mode = "invisible",
  name = "turnstileToken",
  onError,
  onToken,
  resetSignal = 0,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onErrorRef = useRef(onError);
  const onTokenRef = useRef(onToken);
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState("");

  onErrorRef.current = onError;
  onTokenRef.current = onToken;

  const publishToken = useCallback((nextToken: string) => {
    setToken(nextToken);
    onTokenRef.current?.(nextToken);
  }, []);

  const resetChallenge = useCallback(() => {
    const api = window.turnstile;
    const widgetId = widgetIdRef.current;
    if (!api || !widgetId) return;
    publishToken("");
    api.reset(widgetId);
    if (mode === "invisible") api.execute(widgetId);
  }, [mode, publishToken]);

  useEffect(() => {
    if (!ready || !window.turnstile || !containerRef.current || widgetIdRef.current) return;

    const api = window.turnstile;
    const sitekey =
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
      (process.env.NODE_ENV === "development" ? TURNSTILE_TEST_SITE_KEY : "");
    if (!sitekey) {
      console.error("[security] NEXT_PUBLIC_TURNSTILE_SITE_KEY absente sur le déploiement.");
      onErrorRef.current?.();
      return;
    }

    const interactive = mode === "interactive";
    const widgetId = api.render(containerRef.current, {
      sitekey,
      action,
      size: interactive ? "flexible" : "invisible",
      execution: interactive ? "render" : "execute",
      ...(interactive ? { appearance: "always" as const } : {}),
      callback: publishToken,
      "expired-callback": resetChallenge,
      "error-callback": () => {
        publishToken("");
        onErrorRef.current?.();
        return true;
      },
    });

    widgetIdRef.current = widgetId;
    if (!interactive) api.execute(widgetId);

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [action, mode, publishToken, ready, resetChallenge]);

  useEffect(() => {
    if (resetSignal > 0) resetChallenge();
  }, [resetChallenge, resetSignal]);

  const interactiveStyle = {
    position: "relative" as const,
    width: "100%",
    minHeight: 65,
    margin: "16px 0 8px",
  };
  const invisibleStyle = {
    position: "absolute" as const,
    width: 0,
    height: 0,
    margin: 0,
    padding: 0,
    overflow: "visible" as const,
  };

  return (
    <div
      className="turnstile-security"
      aria-live="polite"
      style={mode === "interactive" ? interactiveStyle : invisibleStyle}
    >
      <Script
        id="cloudflare-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      />
      <div ref={containerRef} style={mode === "interactive" ? { width: "100%" } : undefined} />
      {name && <input type="hidden" name={name} value={token} />}
      {!token && <span className="sr-only">Vérification de sécurité requise.</span>}
    </div>
  );
}
