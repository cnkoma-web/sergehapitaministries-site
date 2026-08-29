import { getGoodieBySlug } from "@/lib/content/goodies";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Produit de la boutique";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const goodie = await getGoodieBySlug(slug);
  return renderOgImage({
    eyebrow: "Boutique",
    title: goodie?.title ?? "Boutique",
  });
}
