import { headers } from "next/headers";

export const OFFICIAL_ORIGIN = "https://sergehapitaministries.org";

export async function socialImageUrl(path: string): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "https";
  const origin = host?.endsWith(".vercel.app") ? `${proto}://${host}` : OFFICIAL_ORIGIN;
  return new URL(path, origin).toString();
}

export function officialUrl(path: string): string {
  return new URL(path, OFFICIAL_ORIGIN).toString();
}
