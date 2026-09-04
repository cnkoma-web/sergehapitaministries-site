import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Connaître Jésus";

export default async function Image() {
  return await renderOgImage({ eyebrow: "Une histoire incroyable. Et pourtant…", title: "Connaître Jésus" });
}
