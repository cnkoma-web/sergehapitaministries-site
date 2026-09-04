import { getBookBySlug } from "@/lib/content/books";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Couverture du livre";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  return await renderOgImage({
    eyebrow: "Livre — amDG Éditions",
    title: book?.title ?? "Livre",
    footer: book?.author,
  });
}
