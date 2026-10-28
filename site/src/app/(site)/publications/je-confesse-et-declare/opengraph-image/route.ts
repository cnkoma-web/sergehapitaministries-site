import { getConfessionDuJour } from "@/lib/content/articles";
import { renderOgImage, renderLightweightOgImage } from "@/lib/og";

export const dynamic = "force-dynamic";

export async function GET() {
  const entry = await getConfessionDuJour();
  return renderLightweightOgImage({ category: "jc", title: entry?.title ?? "Je Confesse", coverImageUrl: entry?.cover_url ?? undefined });
}
