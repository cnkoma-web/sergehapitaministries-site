import { getRoseeDuJour } from "@/lib/content/articles";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Rosée Matinale";

export default async function Image() {
  const entry = await getRoseeDuJour();
  return renderOgImage({
    eyebrow: "Rosée Matinale",
    title: entry?.verse_text?.slice(0, 140) ?? "La pensée du jour",
  });
}
