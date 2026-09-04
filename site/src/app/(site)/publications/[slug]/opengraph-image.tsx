import { getArticleBySlugAnyType } from "@/lib/content/articles";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Publication";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlugAnyType(slug);
  if (!article) return renderOgImage({ eyebrow: "Publications", title: "Publications" });
  // "rm" (Rosée Matinale) n'a pas de fiche par slug indépendante — cette
  // route ne sert donc jamais un article de type "rm" en pratique.
  return renderOgImage({
    category: article.type === "rm" ? undefined : article.type,
    eyebrow: article.type === "rm" ? "Rosée Matinale" : undefined,
    title: article.title,
  });
}
