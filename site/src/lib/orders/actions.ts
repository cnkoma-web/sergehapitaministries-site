"use server";

import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";

const TRANSFER_COOKIE = "shm_anonymous_order_transfer";
const TRANSFER_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

/**
 * Conserve brièvement la preuve cryptographique de la session anonyme avant
 * que signInWithPassword ne la remplace par la session du compte existant.
 * Le jeton reste dans un cookie HttpOnly et n'est jamais renvoyé au composant.
 */
export async function prepareAnonymousOrderTransfer(): Promise<{ prepared: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.is_anonymous) return { prepared: false };

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return { prepared: false };

  const { data: order } = await supabase
    .from("orders")
    .select("id")
    .eq("user_id", user.id)
    .not("stripe_checkout_session_id", "is", null)
    .limit(1)
    .maybeSingle();
  if (!order) return { prepared: false };

  const cookieStore = await cookies();
  cookieStore.set(TRANSFER_COOKIE, session.access_token, {
    ...TRANSFER_COOKIE_OPTIONS,
    maxAge: 10 * 60,
  });
  return { prepared: true };
}

/**
 * Relie les commandes de la session anonyme prouvée au compte permanent qui
 * vient de se connecter. `user_id` reste l'identité technique du checkout ;
 * `account_user_id` sert uniquement à l'historique du compte.
 */
export async function linkPreparedAnonymousOrdersToCurrentAccount(): Promise<{
  linked: number;
  error?: string;
}> {
  const cookieStore = await cookies();
  const anonymousAccessToken = cookieStore.get(TRANSFER_COOKIE)?.value;
  if (!anonymousAccessToken) return { linked: 0 };

  const currentSupabase = await createClient();
  const {
    data: { user: currentUser },
  } = await currentSupabase.auth.getUser();
  if (!currentUser || currentUser.is_anonymous) {
    return { linked: 0, error: "real-account-required" };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return { linked: 0, error: "supabase-config-missing" };

  const verifier = createSupabaseClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const {
    data: { user: anonymousUser },
    error: anonymousUserError,
  } = await verifier.auth.getUser(anonymousAccessToken);

  if (anonymousUserError || !anonymousUser?.is_anonymous || anonymousUser.id === currentUser.id) {
    cookieStore.set(TRANSFER_COOKIE, "", { ...TRANSFER_COOKIE_OPTIONS, maxAge: 0 });
    return { linked: 0, error: "anonymous-session-invalid" };
  }

  const service = createServiceRoleClient();
  const { data, error } = await service
    .from("orders")
    .update({ account_user_id: currentUser.id, account_linked_at: new Date().toISOString() })
    .eq("user_id", anonymousUser.id)
    .is("account_user_id", null)
    .not("stripe_checkout_session_id", "is", null)
    .select("id");

  if (error) return { linked: 0, error: "order-link-failed" };

  cookieStore.set(TRANSFER_COOKIE, "", { ...TRANSFER_COOKIE_OPTIONS, maxAge: 0 });
  return { linked: data?.length ?? 0 };
}
