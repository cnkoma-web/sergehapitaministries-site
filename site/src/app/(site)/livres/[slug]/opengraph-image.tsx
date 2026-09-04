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
    // Couverture "bien visible" (retour du 05/09, demande explicite) — mise
    // en page dédiée dans renderOgImage quand elle est fournie ; simple
    // repli sur le gabarit texte si le livre n'a pas encore de couverture.
    coverImageUrl: book?.cover_url ?? undefined,
  });
}
