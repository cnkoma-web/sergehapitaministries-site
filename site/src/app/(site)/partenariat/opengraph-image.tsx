import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Partenariat";

export default function Image() {
  return renderOgImage({ eyebrow: "Partenariat", title: "Associez-vous à cette œuvre du Royaume de Dieu" });
}
