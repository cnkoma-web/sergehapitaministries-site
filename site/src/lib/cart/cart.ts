import { createClient } from "@/lib/supabase/server";

export type CartItem = {
  id: string;
  quantity: number;
  variant_size: string | null;
  variant_color: string | null;
  book: { id: string; slug: string; title: string; price_cents: number | null; cover_url: string | null } | null;
  goodie: { id: string; slug: string; title: string; price_cents: number | null; image_url: string | null } | null;
};

/** Lit le panier de l'utilisateur courant (anonyme ou connecté — même modèle,
 * cahier Phase 5). Retourne un panier vide si aucune session (site toujours
 * consultable sans compte, même si l'ajout au panier nécessite une session). */
export async function getCartItems(): Promise<CartItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: cart } = await supabase.from("carts").select("id").eq("user_id", user.id).maybeSingle();
  if (!cart) return [];

  const { data, error } = await supabase
    .from("cart_items")
    .select(
      "id, quantity, variant_size, variant_color, book:books(id, slug, title, price_cents, cover_url), goodie:goodies(id, slug, title, price_cents, image_url)"
    )
    .eq("cart_id", cart.id)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  // Les relations FK simples renvoient un objet ou un tableau selon la version
  // du client généré — normalisé ici une bonne fois pour toutes.
  return data.map((row) => ({
    ...row,
    book: Array.isArray(row.book) ? row.book[0] ?? null : row.book,
    goodie: Array.isArray(row.goodie) ? row.goodie[0] ?? null : row.goodie,
  })) as CartItem[];
}

export async function getCartCount(): Promise<number> {
  const items = await getCartItems();
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartSubtotalCents(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const price = item.book?.price_cents ?? item.goodie?.price_cents ?? 0;
    return sum + price * item.quantity;
  }, 0);
}
