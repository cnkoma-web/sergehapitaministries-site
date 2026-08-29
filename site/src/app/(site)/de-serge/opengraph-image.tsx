import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "De Serge";

export default function Image() {
  return renderOgImage({ eyebrow: "Prophète · Enseignant · Auteur", title: "De Serge" });
}
