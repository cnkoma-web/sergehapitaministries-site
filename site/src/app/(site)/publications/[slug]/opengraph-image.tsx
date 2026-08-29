import { getArticleBySlugAnyType, ARTICLE_TYPE_LABEL } from "@/lib/content/articles";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Publication";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlugAnyType(slug);
  return renderOgImage({
    eyebrow: article ? ARTICLE_TYPE_LABEL[article.type] : "Publications",
    title: article?.title ?? "Publications",
  });
}
