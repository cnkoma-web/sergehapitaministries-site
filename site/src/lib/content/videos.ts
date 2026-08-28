import { createClient } from "@/lib/supabase/server";
import type { Video, VideoCategory } from "./videoTypes";

export type { VideoCategory, Video } from "./videoTypes";
export { VIDEO_CATEGORY_LABEL, extractYoutubeId } from "./videoTypes";

export async function getVideos(): Promise<Video[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("videos")
    .select("id, title, description, category, youtube_url")
    .eq("active", true)
    .order("position", { ascending: true });
  if (error || !data) return [];
  return data;
}

// ===== Admin =====

export type AdminVideo = Video & { category: VideoCategory; position: number; active: boolean };

export async function getVideosAdmin(page: number, perPage: number): Promise<{ videos: AdminVideo[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const { data, error, count } = await supabase
    .from("videos")
    .select("id, title, description, category, youtube_url, position, active", { count: "exact" })
    .order("position", { ascending: true })
    .range(from, from + perPage - 1);
  if (error || !data) return { videos: [], total: 0 };
  return { videos: data, total: count ?? 0 };
}

export async function getVideoByIdAdmin(id: string): Promise<AdminVideo | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("videos")
    .select("id, title, description, category, youtube_url, position, active")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data;
}
