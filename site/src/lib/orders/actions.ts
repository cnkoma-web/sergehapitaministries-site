"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
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
 * qu'une connexion par mot de passe ou OAuth ne la remplace.
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
  const cookieStore = await cookies();
  cookieStore.set(TRANSFER_COOKIE, session.access_token, {
    ...TRANSFER_COOKIE_OPTIONS,
    maxAge: 10 * 60,
  });
  return { prepared: Boolean(order) };
}

type CartItem = {
  id: string;
  book_id: string | null;
  goodie_id: string | null;
  quantity: number;
  variant_size: string | null;
  variant_color: string | null;
};

function sameCartLine(left: CartItem, right: CartItem) {
  return (
    left.book_id === right.book_id &&
    left.goodie_id === right.goodie_id &&
    left.variant_size === right.variant_size &&
    left.variant_color === right.variant_color
  );
}

async function transferAnonymousCart(
  service: ReturnType<typeof createServiceRoleClient>,
  anonymousUserId: string,
  currentUserId: string
): Promise<{ merged: number; error?: string }> {
  const { data: anonymousCart, error: anonymousCartError } = await service
    .from("carts")
    .select("id")
    .eq("user_id", anonymousUserId)
    .maybeSingle();
  if (anonymousCartError) return { merged: 0, error: "anonymous-cart-read-failed" };
  if (!anonymousCart) return { merged: 0 };

  const { data: currentCart, error: currentCartError } = await service
    .from("carts")
    .select("id")
    .eq("user_id", currentUserId)
    .maybeSingle();
  if (currentCartError) return { merged: 0, error: "account-cart-read-failed" };

  // Le cas courant est une simple réattribution : aucune copie, donc aucune
  // fenêtre de duplication entre l'ancienne et la nouvelle session.
  if (!currentCart) {
    const { data: moved, error: moveError } = await service
      .from("carts")
      .update({ user_id: currentUserId })
      .eq("id", anonymousCart.id)
      .select("id")
      .maybeSingle();
    if (!moveError && moved) return { merged: 1 };

    // Une autre requête a pu créer le panier du compte entre la lecture et
    // l'écriture. On le relit puis poursuit par la fusion ligne à ligne.
    const { data: racedCart, error: racedCartError } = await service
      .from("carts")
      .select("id")
      .eq("user_id", currentUserId)
      .maybeSingle();
    if (racedCartError || !racedCart) return { merged: 0, error: "cart-reassign-failed" };
    return mergeCartLines(service, anonymousCart.id, racedCart.id);
  }

  return mergeCartLines(service, anonymousCart.id, currentCart.id);
}

async function mergeCartLines(
  service: ReturnType<typeof createServiceRoleClient>,
  anonymousCartId: string,
  currentCartId: string
): Promise<{ merged: number; error?: string }> {
  const [{ data: anonymousItems, error: anonymousItemsError }, { data: currentItems, error: currentItemsError }] =
    await Promise.all([
      service
        .from("cart_items")
        .select("id, book_id, goodie_id, quantity, variant_size, variant_color")
        .eq("cart_id", anonymousCartId),
      service
        .from("cart_items")
        .select("id, book_id, goodie_id, quantity, variant_size, variant_color")
        .eq("cart_id", currentCartId),
    ]);

  if (anonymousItemsError || currentItemsError) return { merged: 0, error: "cart-items-read-failed" };

  let merged = 0;
  const targetItems = (currentItems ?? []) as CartItem[];
  for (const sourceItem of (anonymousItems ?? []) as CartItem[]) {
    const existing = targetItems.find((targetItem) => sameCartLine(sourceItem, targetItem));
    if (existing) {
      const { error: updateError } = await service
        .from("cart_items")
        .update({ quantity: existing.quantity + sourceItem.quantity })
        .eq("id", existing.id);
      if (updateError) return { merged, error: "cart-item-merge-failed" };

      const { error: deleteError } = await service.from("cart_items").delete().eq("id", sourceItem.id);
      if (deleteError) return { merged, error: "cart-source-cleanup-failed" };
      existing.quantity += sourceItem.quantity;
    } else {
      const { error: moveError } = await service
        .from("cart_items")
        .update({ cart_id: currentCartId })
        .eq("id", sourceItem.id);
      if (moveError) return { merged, error: "cart-item-move-failed" };
      targetItems.push({ ...sourceItem });
    }
    merged += 1;
  }

  const { error: cleanupError } = await service.from("carts").delete().eq("id", anonymousCartId);
  if (cleanupError) return { merged, error: "anonymous-cart-cleanup-failed" };
  return { merged };
}

/**
 * Relie les commandes de la session anonyme prouvée au compte permanent qui
 * vient de se connecter. `user_id` reste l'identité technique du checkout ;
 * `account_user_id` sert uniquement à l'historique du compte.
 */
export async function linkPreparedAnonymousOrdersToCurrentAccount(): Promise<{
  linked: number;
  merged: number;
  error?: string;
}> {
  const cookieStore = await cookies();
  const anonymousAccessToken = cookieStore.get(TRANSFER_COOKIE)?.value;
  if (!anonymousAccessToken) return { linked: 0, merged: 0 };

  const currentSupabase = await createClient();
  const {
    data: { user: currentUser },
  } = await currentSupabase.auth.getUser();
  if (!currentUser || currentUser.is_anonymous) {
    return { linked: 0, merged: 0, error: "real-account-required" };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return { linked: 0, merged: 0, error: "supabase-config-missing" };

  const verifier = createSupabaseClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const {
    data: { user: anonymousUser },
    error: anonymousUserError,
  } = await verifier.auth.getUser(anonymousAccessToken);

  if (anonymousUserError || !anonymousUser?.is_anonymous || anonymousUser.id === currentUser.id) {
    cookieStore.set(TRANSFER_COOKIE, "", { ...TRANSFER_COOKIE_OPTIONS, maxAge: 0 });
    return { linked: 0, merged: 0, error: "anonymous-session-invalid" };
  }

  const service = createServiceRoleClient();
  const { data: checkoutOrder, error: checkoutReadError } = await service
    .from("orders")
    .select("id")
    .eq("user_id", anonymousUser.id)
    .not("stripe_checkout_session_id", "is", null)
    .limit(1)
    .maybeSingle();
  if (checkoutReadError) return { linked: 0, merged: 0, error: "order-read-failed" };

  const { data, error } = await service
    .from("orders")
    .update({ account_user_id: currentUser.id, account_linked_at: new Date().toISOString() })
    .eq("user_id", anonymousUser.id)
    .is("account_user_id", null)
    .not("stripe_checkout_session_id", "is", null)
    .select("id");

  if (error) return { linked: 0, merged: 0, error: "order-link-failed" };

  // Un panier ayant déjà engendré un checkout ne doit pas être recopié dans
  // le compte. Sinon, on transfère son contenu après vérification des deux
  // identités, exclusivement avec le client serveur privilégié.
  const cartTransfer = checkoutOrder
    ? { merged: 0 }
    : await transferAnonymousCart(service, anonymousUser.id, currentUser.id);
  if (cartTransfer.error) {
    return { linked: data?.length ?? 0, merged: cartTransfer.merged, error: cartTransfer.error };
  }

  cookieStore.set(TRANSFER_COOKIE, "", { ...TRANSFER_COOKIE_OPTIONS, maxAge: 0 });
  if (cartTransfer.merged > 0) {
    revalidatePath("/panier");
    revalidatePath("/", "layout");
  }
  return { linked: data?.length ?? 0, merged: cartTransfer.merged };
}
