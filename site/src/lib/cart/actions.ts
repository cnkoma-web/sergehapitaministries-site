"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

async function getOrCreateCartId(supabase: SupabaseClient, userId: string): Promise<string> {
  const { data: existing } = await supabase.from("carts").select("id").eq("user_id", userId).maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase.from("carts").insert({ user_id: userId }).select("id").single();
  if (error) throw error;
  return created.id;
}

type AddToCartInput = {
  bookId?: string;
  goodieId?: string;
  variantSize?: string;
  variantColor?: string;
  quantity?: number;
};

export async function addToCart(input: AddToCartInput): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "no-session" };

  const cartId = await getOrCreateCartId(supabase, user.id);
  const quantity = input.quantity ?? 1;

  let existingQuery = supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("variant_size", input.variantSize ?? null)
    .eq("variant_color", input.variantColor ?? null);
  existingQuery = input.bookId ? existingQuery.eq("book_id", input.bookId) : existingQuery.eq("goodie_id", input.goodieId);
  const { data: existing } = await existingQuery.maybeSingle();

  if (existing) {
    await supabase.from("cart_items").update({ quantity: existing.quantity + quantity }).eq("id", existing.id);
  } else {
    await supabase.from("cart_items").insert({
      cart_id: cartId,
      book_id: input.bookId ?? null,
      goodie_id: input.goodieId ?? null,
      variant_size: input.variantSize ?? null,
      variant_color: input.variantColor ?? null,
      quantity,
    });
  }

  revalidatePath("/panier");
  revalidatePath("/", "layout");
  return {};
}

export async function updateCartItemQuantity(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const quantity = Number(formData.get("quantity"));
  if (!id || !Number.isFinite(quantity)) return;

  if (quantity <= 0) {
    await supabase.from("cart_items").delete().eq("id", id);
  } else {
    await supabase.from("cart_items").update({ quantity }).eq("id", id);
  }

  revalidatePath("/panier");
  revalidatePath("/", "layout");
}

export async function removeCartItem(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  if (!id) return;
  await supabase.from("cart_items").delete().eq("id", id);
  revalidatePath("/panier");
  revalidatePath("/", "layout");
}

/** Capture le panier courant juste AVANT une connexion (LoginForm) — pendant
 * qu'il s'agit encore de la session anonyme, remplacée ensuite par la vraie
 * session dès que signInWithPassword réussit. */
export async function getCartItemsForMerge() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: cart } = await supabase.from("carts").select("id").eq("user_id", user.id).maybeSingle();
  if (!cart) return [];

  const { data } = await supabase
    .from("cart_items")
    .select("book_id, goodie_id, quantity, variant_size, variant_color")
    .eq("cart_id", cart.id);

  return (data ?? []).map((row) => ({
    bookId: row.book_id,
    goodieId: row.goodie_id,
    quantity: row.quantity,
    variantSize: row.variant_size,
    variantColor: row.variant_color,
  }));
}

/** Appelé juste après une connexion réussie (pas une inscription — l'upgrade
 * anonyme->compte de la Phase 5 conserve déjà le même panier). Fusionne les
 * articles du panier anonyme (capturés avant la connexion, session remplacée
 * ensuite par Supabase) dans le panier du compte réel. */
export async function mergeCartItemsIntoCurrentUser(
  items: { bookId: string | null; goodieId: string | null; quantity: number; variantSize: string | null; variantColor: string | null }[]
) {
  if (items.length === 0) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const cartId = await getOrCreateCartId(supabase, user.id);

  for (const item of items) {
    let existingQuery = supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("variant_size", item.variantSize)
      .eq("variant_color", item.variantColor);
    existingQuery = item.bookId ? existingQuery.eq("book_id", item.bookId) : existingQuery.eq("goodie_id", item.goodieId);
    const { data: existing } = await existingQuery.maybeSingle();

    if (existing) {
      await supabase.from("cart_items").update({ quantity: existing.quantity + item.quantity }).eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({
        cart_id: cartId,
        book_id: item.bookId,
        goodie_id: item.goodieId,
        variant_size: item.variantSize,
        variant_color: item.variantColor,
        quantity: item.quantity,
      });
    }
  }

  revalidatePath("/panier");
  revalidatePath("/", "layout");
}
