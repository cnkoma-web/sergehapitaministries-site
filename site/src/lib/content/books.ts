import { createClient } from "@/lib/supabase/server";

export type BookStatus = "active" | "precommande" | "hidden";

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
  status: BookStatus;
  position: number;
  // Deuxième image de la galerie (dos de couverture, position 2) — sert à
  // l'effet de survol (rollover) sur les vignettes (cahier §6.4, référence
  // rochedy.com) : null si le livre n'a qu'une seule image, on ne simule
  // jamais un second visuel qui n'existe pas.
  hover_cover_url: string | null;
};

export type BookImage = { id: string; url: string; position: number };

const COLUMNS =
  "id, slug, title, author, publisher, badge, price_cents, cover_url, format, pages, language, isbn, description, status, position";
const ADMIN_COLUMNS =
  "id, slug, title, author, publisher, badge, price_cents, cover_url, format, pages, language, isbn, description, status, position, active";

// Une seule requête groupée pour la 2e image (position 1 = dos de couverture)
// de chaque livre donné, plutôt qu'une requête par livre.
async function getHoverCovers(bookIds: string[]): Promise<Map<string, string>> {
  if (bookIds.length === 0) return new Map();
  const supabase = await createClient();
  const { data } = await supabase.from("book_images").select("book_id, url").in("book_id", bookIds).eq("position", 1);
  return new Map((data ?? []).map((row) => [row.book_id as string, row.url as string]));
}

export async function getBooks(): Promise<Book[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select(COLUMNS)
    .neq("status", "hidden")
    .order("position", { ascending: true });
  if (error || !data) return [];
  const hoverCovers = await getHoverCovers(data.map((b) => b.id));
  return data.map((b) => ({ ...b, hover_cover_url: hoverCovers.get(b.id) ?? null }));
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select(COLUMNS)
    .eq("slug", slug)
    .neq("status", "hidden")
    .single();
  if (error || !data) return null;
  const hoverCovers = await getHoverCovers([data.id]);
  return { ...data, hover_cover_url: hoverCovers.get(data.id) ?? null };
}

export async function getBookImages(bookId: string): Promise<BookImage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("book_images")
    .select("id, url, position")
    .eq("book_id", bookId)
    .order("position", { ascending: true });
  if (error || !data) return [];
  return data;
}

export type AdjacentBook = { slug: string; title: string };

export async function getAdjacentBooks(position: number): Promise<{ prev: AdjacentBook | null; next: AdjacentBook | null }> {
  const supabase = await createClient();
  const [{ data: prevData }, { data: nextData }] = await Promise.all([
    supabase
      .from("books")
      .select("slug, title")
      .neq("status", "hidden")
      .lt("position", position)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("books")
      .select("slug, title")
      .neq("status", "hidden")
      .gt("position", position)
      .order("position", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);
  return { prev: prevData, next: nextData };
}

// ===== Admin (voit aussi les livres masqués) =====

// L'admin n'a pas besoin de hover_cover_url (effet public uniquement).
export type AdminBook = Omit<Book, "hover_cover_url"> & { active: boolean };

export async function getBooksAdmin(page: number, perPage: number): Promise<{ books: AdminBook[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const { data, error, count } = await supabase
    .from("books")
    .select(ADMIN_COLUMNS, { count: "exact" })
    .order("position", { ascending: true })
    .range(from, from + perPage - 1);
  if (error || !data) return { books: [], total: 0 };
  return { books: data, total: count ?? 0 };
}

export async function getBookByIdAdmin(id: string): Promise<AdminBook | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("books").select(ADMIN_COLUMNS).eq("id", id).single();
  if (error || !data) return null;
  return data;
}
