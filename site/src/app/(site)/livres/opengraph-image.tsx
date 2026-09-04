import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Livres";

export default async function Image() {
  return await renderOgImage({ eyebrow: "amDG Éditions", title: "Livres" });
}
