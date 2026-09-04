import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Publications";

export default async function Image() {
  return await renderOgImage({ eyebrow: "Que Dit la Bible ? · La Vie Supérieure · Rosée Matinale", title: "Publications" });
}
