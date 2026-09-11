import { createClient } from "@/lib/supabase/server";
import type { ArticleType } from "@/lib/content/articles";

// V2 Lot 9 (11/09) — Podcast, nouvelle fonctionnalité additive. "universe"
// réutilise directement les 4 catégories existantes (ArticleType) — jamais
// une taxonomie séparée à maintenir en double.
export type PodcastUniverse = ArticleType;

export type PodcastEpisode = {
  id: string;
  slug: string;
  universe: PodcastUniverse;
  title: string;
  theme: string | null;
  episode_date: string;
  audio_url: string;
  duration_seconds: number | null;
  cover_url: string | null;
  share_image_url: string | null;
  linked_article_id: string | null;
  position: number;
};

const COLUMNS =
  "id, slug, universe, title, theme, episode_date, audio_url, duration_seconds, cover_url, share_image_url, linked_article_id, position";
const ADMIN_COLUMNS = `${COLUMNS}, status`;

export type AdminPodcastEpisode = PodcastEpisode & { status: "draft" | "published" };

/** Pagination fixe (cahier §Lot 9) — 8 épisodes par page, sur la
 * bibliothèque publique comme sur ses filtres par univers. */
export async function getPodcastEpisodes(
  page: number,
  perPage: number,
  universe?: PodcastUniverse
): Promise<{ episodes: PodcastEpisode[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  let query = supabase
    .from("podcast_episodes")
    .select(COLUMNS, { count: "exact" })
    .eq("status", "published");
  if (universe) query = query.eq("universe", universe);
  const { data, error, count } = await query
    .order("episode_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);
  if (error || !data) return { episodes: [], total: 0 };
  return { episodes: data, total: count ?? 0 };
}

export async function getPodcastEpisodeBySlug(slug: string): Promise<PodcastEpisode | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("podcast_episodes")
    .select(COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  if (error || !data) return null;
  return data;
}

// ===== Admin (voit aussi les brouillons) =====

export async function getPodcastEpisodesAdmin(
  page: number,
  perPage: number
): Promise<{ episodes: AdminPodcastEpisode[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const { data, error, count } = await supabase
    .from("podcast_episodes")
    .select(ADMIN_COLUMNS, { count: "exact" })
    .order("episode_date", { ascending: false })
    .range(from, from + perPage - 1);
  if (error || !data) return { episodes: [], total: 0 };
  return { episodes: data, total: count ?? 0 };
}

export async function getPodcastEpisodeByIdAdmin(id: string): Promise<AdminPodcastEpisode | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("podcast_episodes").select(ADMIN_COLUMNS).eq("id", id).single();
  if (error || !data) return null;
  return data;
}
