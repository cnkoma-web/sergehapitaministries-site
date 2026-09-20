"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000BB";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      size: "invisible";
      execution: "execute";
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
  name?: string | false;
  onToken?: (token: string) => void;
  resetSignal?: number;
};

/**
 * Widget Turnstile invisible partagé par les formulaires et Supabase Auth.
 * La clé factice officielle Cloudflare n'est utilisée qu'en préproduction
 * lorsque la vraie clé publique n'est pas encore configurée.
 */
export default function TurnstileWidget({
  action,
  name = "turnstileToken",
  onToken,
  resetSignal = 0,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState("");

  onTokenRef.current = onToken;

  const publishToken = useCallback((nextToken: string) => {
    setToken(nextToken);
    onTokenRef.current?.(nextToken);
  }, []);

  const executeChallenge = useCallback(() => {
    const api = window.turnstile;
    const widgetId = widgetIdRef.current;
    if (!api || !widgetId) return;
    publishToken("");
    api.reset(widgetId);
    api.execute(widgetId);
  }, [publishToken]);

  useEffect(() => {
    if (!ready || !window.turnstile || !containerRef.current || widgetIdRef.current) return;

    const api = window.turnstile;
    const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || TURNSTILE_TEST_SITE_KEY;
    const widgetId = api.render(containerRef.current, {
      sitekey,
      action,
      size: "invisible",
      execution: "execute",
      callback: publishToken,
      "expired-callback": executeChallenge,
      "error-callback": () => {
        publishToken("");
        return true;
      },
    });

    widgetIdRef.current = widgetId;
    api.execute(widgetId);

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [action, executeChallenge, publishToken, ready]);

  useEffect(() => {
    if (resetSignal > 0) executeChallenge();
  }, [executeChallenge, resetSignal]);

  return (
    <div
      className="turnstile-security"
      aria-live="polite"
      style={{ position: "absolute", width: 0, height: 0, margin: 0, padding: 0, overflow: "visible" }}
    >
      <Script
        id="cloudflare-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      />
      <div ref={containerRef} />
      {name && <input type="hidden" name={name} value={token} />}
      {!token && <span className="sr-only">Vérification de sécurité en cours.</span>}
    </div>
  );
}
