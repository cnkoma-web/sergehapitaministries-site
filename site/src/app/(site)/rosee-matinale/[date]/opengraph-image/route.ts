import { getPublishedArticles } from "@/lib/content/articles";
import { renderOgImage } from "@/lib/og";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const entries = await getPublishedArticles("rm");
  const entry = entries.find((e) => e.article_date === date);
  return renderOgImage({ category: "rm", title: entry?.title ?? "Rosée Matinale", coverImageUrl: entry?.cover_url ?? undefined });
}
