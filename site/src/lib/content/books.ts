import { createClient } from "@/lib/supabase/server";

export type Book = {
  id: string;
  slug: string;
  title: string;
  author: string;
  publisher: string;
  badge: string | null;
  price_cents: number | null;
  cover_url: string | null;
  format: string | null;
  pages: number | null;
  language: string | null;
  isbn: string | null;
  description: string | null;
  position: number;
};

export async function getBooks(): Promise<Book[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("id, slug, title, author, publisher, badge, price_cents, cover_url, format, pages, language, isbn, description, position")
    .eq("active", true)
    .order("position", { ascending: true });
  if (error || !data) return [];
  return data;
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("id, slug, title, author, publisher, badge, price_cents, cover_url, format, pages, language, isbn, description, position")
    .eq("slug", slug)
    .eq("active", true)
    .single();
  if (error || !data) return null;
  return data;
}

export type AdjacentBook = { slug: string; title: string };

export async function getAdjacentBooks(position: number): Promise<{ prev: AdjacentBook | null; next: AdjacentBook | null }> {
  const supabase = await createClient();
  const [{ data: prevData }, { data: nextData }] = await Promise.all([
    supabase
      .from("books")
      .select("slug, title")
      .eq("active", true)
      .lt("position", position)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("books")
      .select("slug, title")
      .eq("active", true)
      .gt("position", position)
      .order("position", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);
  return { prev: prevData, next: nextData };
}

export async function countActiveBooks(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase.from("books").select("id", { count: "exact", head: true }).eq("active", true);
  return count ?? 0;
}
