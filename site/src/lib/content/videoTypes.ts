// Types + helpers purs (sans dépendance serveur) — importables depuis un Client
// Component (VideoGrid.tsx) sans entraîner le client Supabase serveur dans le
// bundle navigateur (même précaution que navTypes.ts, cf. Phase 2).

export type VideoCategory = "predications" | "enseignements" | "temoignages";

export type Video = {
  id: string;
  title: string;
  description: string | null;
  category: VideoCategory;
  youtube_url: string | null;
};

export const VIDEO_CATEGORY_LABEL: Record<VideoCategory, string> = {
  predications: "Prédications",
  enseignements: "Enseignements",
  temoignages: "Témoignages",
};

export function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/);
  return match ? match[1] : null;
}
