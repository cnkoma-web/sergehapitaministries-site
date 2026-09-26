import { getRoseeDuJour } from "@/lib/content/articles";
import { renderOgImage, renderLightweightOgImage } from "@/lib/og";

export const dynamic = "force-dynamic";

export async function GET() {
  const entry = await getRoseeDuJour();
  return renderLightweightOgImage({ category: "rm", title: entry?.title ?? "Rosée Matinale", coverImageUrl: entry?.cover_url ?? undefined });
}
