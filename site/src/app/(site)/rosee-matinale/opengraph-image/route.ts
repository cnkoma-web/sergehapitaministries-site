import { getRoseeDuJour } from "@/lib/content/articles";
import { renderOgImage } from "@/lib/og";

export const dynamic = "force-dynamic";

export async function GET() {
  const entry = await getRoseeDuJour();
  return renderOgImage({ category: "rm", title: entry?.title ?? "Rosée Matinale", coverImageUrl: entry?.cover_url ?? undefined });
}
