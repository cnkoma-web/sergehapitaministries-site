import { getArticleBySlugAnyType } from "@/lib/content/articles";
import { renderOgImage, renderLightweightOgImage } from "@/lib/og";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlugAnyType(slug);
  if (!article) return renderLightweightOgImage({ eyebrow: "Publications", title: "Publications" });
  return renderLightweightOgImage({
    category: article.type === "rm" ? undefined : article.type,
    eyebrow: article.type === "rm" ? "Rosée Matinale" : undefined,
    title: article.title,
    coverImageUrl: article.cover_url ?? undefined,
  });
}
