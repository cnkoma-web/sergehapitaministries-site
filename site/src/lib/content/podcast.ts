import { createClient } from "@/lib/supabase/server";
import type { ArticleType } from "@/lib/content/articles";
import { resolvePodcastAudioUrl } from "@/lib/podcast/resolveAudioUrl";

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
  linked_article_cover_url: string | null;
  share_image_url: string | null;
  linked_article_id: string | null;
  position: number;
};

const COLUMNS =
  "id, slug, universe, title, theme, episode_date, audio_url, duration_seconds, cover_url, share_image_url, linked_article_id, position";
const ADMIN_COLUMNS = `${COLUMNS}, status`;

export type AdminPodcastEpisode = PodcastEpisode & { status: "draft" | "published" };

type PodcastEpisodeRow = Omit<PodcastEpisode, "linked_article_cover_url">;

async function addLinkedArticleCovers(
  supabase: Awaited<ReturnType<typeof createClient>>,
  episodes: PodcastEpisodeRow[]
): Promise<PodcastEpisode[]> {
  const articleIds = [...new Set(episodes.map((episode) => episode.linked_article_id).filter((id): id is string => Boolean(id)))];
  if (articleIds.length === 0) {
    return episodes.map((episode) => ({ ...episode, linked_article_cover_url: null }));
  }

  const { data: articles } = await supabase.from("articles").select("id, cover_url").in("id", articleIds);
  const covers = new Map((articles ?? []).map((article) => [article.id, article.cover_url]));
  return episodes.map((episode) => ({
    ...episode,
    linked_article_cover_url: episode.linked_article_id ? covers.get(episode.linked_article_id) ?? null : null,
  }));
}

async function resolvePublicEpisodeAudio(episode: PodcastEpisode): Promise<PodcastEpisode> {
  return { ...episode, audio_url: await resolvePodcastAudioUrl(episode.audio_url) };
}

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
  const episodes = await addLinkedArticleCovers(supabase, data);
  return {
    episodes: await Promise.all(episodes.map(resolvePublicEpisodeAudio)),
    total: count ?? 0,
  };
}

export async function getPublishedPodcastEpisodesForSitemap(): Promise<
  { slug: string; updated_at: string; episode_date: string }[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("podcast_episodes")
    .select("slug, updated_at, episode_date")
    .eq("status", "published")
    .order("episode_date", { ascending: false });
  if (error || !data) return [];
  return data;
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
  const [episode] = await addLinkedArticleCovers(supabase, [data]);
  return resolvePublicEpisodeAudio(episode);
}

export async function getPodcastEpisodeForArticle(
  articleId: string,
  episodeId?: string | null
): Promise<PodcastEpisode | null> {
  const supabase = await createClient();

  if (episodeId) {
    const { data } = await supabase
      .from("podcast_episodes")
      .select(COLUMNS)
      .eq("id", episodeId)
      .eq("status", "published")
      .maybeSingle();
    if (data) {
      const [episode] = await addLinkedArticleCovers(supabase, [data]);
      return resolvePublicEpisodeAudio(episode);
    }
  }

  const { data, error } = await supabase
    .from("podcast_episodes")
    .select(COLUMNS)
    .eq("linked_article_id", articleId)
    .eq("status", "published")
    .order("episode_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  const [episode] = await addLinkedArticleCovers(supabase, [data]);
  return resolvePublicEpisodeAudio(episode);
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
  return {
    episodes: (await addLinkedArticleCovers(supabase, data)) as AdminPodcastEpisode[],
    total: count ?? 0,
  };
}

/** Épisodes proposés dans les formulaires de liaison du CMS. Les brouillons
 * restent visibles afin que l'association puisse être préparée avant leur
 * publication ; le lecteur public n'apparaît qu'une fois l'épisode publié. */
export async function getPodcastEpisodeOptionsForLinking(
  universe: PodcastUniverse
): Promise<Pick<AdminPodcastEpisode, "id" | "title" | "episode_date" | "status">[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("podcast_episodes")
    .select("id, title, episode_date, status")
    .eq("universe", universe)
    .order("episode_date", { ascending: false })
    .limit(200);
  if (error || !data) return [];
  return data;
}

export async function getPodcastEpisodeByIdAdmin(id: string): Promise<AdminPodcastEpisode | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("podcast_episodes").select(ADMIN_COLUMNS).eq("id", id).single();
  if (error || !data) return null;
  const [episode] = await addLinkedArticleCovers(supabase, [data]);
  return episode as AdminPodcastEpisode;
}

