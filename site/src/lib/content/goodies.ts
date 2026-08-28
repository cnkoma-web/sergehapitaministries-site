import { createClient } from "@/lib/supabase/server";

export type Goodie = {
  id: string;
  slug: string;
  title: string;
  price_cents: number | null;
  image_url: string | null;
  sizes: string[];
  colors: string[];
  material: string | null;
  cut: string | null;
  care: string | null;
  fabrication: string | null;
  shipping_delay: string | null;
  description: string | null;
  status: "available" | "coming_soon";
  position: number;
};

const COLUMNS =
  "id, slug, title, price_cents, image_url, sizes, colors, material, cut, care, fabrication, shipping_delay, description, status, position";

export async function getGoodies(): Promise<Goodie[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("goodies").select(COLUMNS).eq("active", true).order("position", { ascending: true });
  if (error || !data) return [];
  return data;
}

export async function getGoodieBySlug(slug: string): Promise<Goodie | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("goodies").select(COLUMNS).eq("slug", slug).eq("active", true).single();
  if (error || !data) return null;
  return data;
}

// ===== Admin (voit aussi les goodies masqués) =====

export type AdminGoodie = Goodie & { active: boolean };
const ADMIN_COLUMNS =
  "id, slug, title, price_cents, image_url, sizes, colors, material, cut, care, fabrication, shipping_delay, description, status, position, active";

export async function getGoodiesAdmin(page: number, perPage: number): Promise<{ goodies: AdminGoodie[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const { data, error, count } = await supabase
    .from("goodies")
    .select(ADMIN_COLUMNS, { count: "exact" })
    .order("position", { ascending: true })
    .range(from, from + perPage - 1);
  if (error || !data) return { goodies: [], total: 0 };
  return { goodies: data, total: count ?? 0 };
}

export async function getGoodieByIdAdmin(id: string): Promise<AdminGoodie | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("goodies").select(ADMIN_COLUMNS).eq("id", id).single();
  if (error || !data) return null;
  return data;
}
