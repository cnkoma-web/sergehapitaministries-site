import "server-only";

import { headers } from "next/headers";

const TURNSTILE_TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type TurnstileResponse = {
  success?: boolean;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
};

function isNonProductionEnvironment() {
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV !== "production";
  return process.env.NODE_ENV !== "production";
}

export async function getRequestIp(): Promise<string> {
  const requestHeaders = await headers();
  return (
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export async function verifyTurnstileToken(token: string, expectedAction: string): Promise<boolean> {
  if (!token || token.length > 4096) return false;

  const secret = process.env.TURNSTILE_SECRET_KEY ||
    (isNonProductionEnvironment() ? TURNSTILE_TEST_SECRET_KEY : "");
  if (!secret) {
    console.error("[security] TURNSTILE_SECRET_KEY absente en production.");
    return false;
  }

  const body = new FormData();
  body.set("secret", secret);
  body.set("response", token);
  const ip = await getRequestIp();
  if (ip !== "unknown") body.set("remoteip", ip);

  try {
    const response = await fetch(VERIFY_URL, { method: "POST", body, cache: "no-store" });
    if (!response.ok) return false;
    const result = (await response.json()) as TurnstileResponse;
    if (!result.success) {
      console.warn("[security] Turnstile a refusé une soumission :", result["error-codes"] ?? []);
      return false;
    }
    return !result.action || result.action === expectedAction;
  } catch (error) {
    console.error("[security] Vérification Turnstile indisponible :", error);
    return false;
  }
}

export async function verifyHumanForm(formData: FormData, expectedAction: string): Promise<boolean> {
  if (String(formData.get("website") ?? "").trim()) return false;

  const startedAt = Number(formData.get("formStartedAt"));
  const elapsed = Date.now() - startedAt;
  if (!Number.isFinite(startedAt) || elapsed < 800 || elapsed > 4 * 60 * 60 * 1000) return false;

  return verifyTurnstileToken(String(formData.get("turnstileToken") ?? ""), expectedAction);
}
