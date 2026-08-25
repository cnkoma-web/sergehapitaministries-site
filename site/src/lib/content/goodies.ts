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
  status: "available" | "coming_soon";
  position: number;
};

const COLUMNS = "id, slug, title, price_cents, image_url, sizes, colors, material, cut, care, fabrication, shipping_delay, status, position";

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
