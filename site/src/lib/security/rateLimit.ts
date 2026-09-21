import "server-only";

import { createHmac } from "node:crypto";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { getRequestIp } from "@/lib/security/turnstile";

type Options = {
  scope: string;
  limit: number;
  windowSeconds: number;
  identity?: string;
};

function hashSubject(value: string) {
  const secret = process.env.RATE_LIMIT_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("Secret de limitation absent.");
  return createHmac("sha256", secret).update(value).digest("hex");
}

async function registerAttempt(scope: string, subject: string, limit: number, windowSeconds: number) {
  const service = createServiceRoleClient();
  const { data, error } = await service.rpc("register_form_attempt", {
    p_scope: scope,
    p_subject_hash: hashSubject(subject),
    p_window_seconds: windowSeconds,
    p_limit: limit,
  });
  if (error) {
    console.error(`[security] Rate limit ${scope} indisponible :`, error.message);
    return false;
  }
  return data === true;
}

export async function allowSubmission({ scope, limit, windowSeconds, identity }: Options): Promise<boolean> {
  const ip = await getRequestIp();
  const ipAllowed = await registerAttempt(`${scope}:ip`, ip, limit, windowSeconds);
  if (!ipAllowed || !identity) return ipAllowed;

  return registerAttempt(
    `${scope}:identity`,
    identity.trim().toLowerCase(),
    Math.max(limit, 3),
    windowSeconds
  );
}
