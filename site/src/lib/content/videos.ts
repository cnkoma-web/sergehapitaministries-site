import { createClient } from "@/lib/supabase/server";
import type { Video } from "./videoTypes";

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
