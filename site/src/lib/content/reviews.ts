import { createClient } from "@/lib/supabase/server";

export type ReviewTarget = { bookId?: string; goodieId?: string };

export type Review = {
  id: string;
  author_name: string | null;
  rating: number | null;
  body: string | null;
  created_at: string;
};

export type ReviewSummary = { count: number; average: number | null };

export async function getReviewSummary(target: ReviewTarget): Promise<ReviewSummary> {
  const supabase = await createClient();
  let query = supabase.from("review_summaries").select("review_count, average_rating");
  query = target.bookId ? query.eq("book_id", target.bookId) : query.eq("goodie_id", target.goodieId);
  const { data } = await query.maybeSingle();
  if (!data) return { count: 0, average: null };
  return { count: data.review_count, average: data.average_rating };
}

export async function getApprovedReviews(target: ReviewTarget): Promise<Review[]> {
  const supabase = await createClient();
  let query = supabase
    .from("reviews")
    .select("id, author_name, rating, body, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  query = target.bookId ? query.eq("book_id", target.bookId) : query.eq("goodie_id", target.goodieId);
  const { data, error } = await query;
  if (error || !data) return [];
  return data;
}
