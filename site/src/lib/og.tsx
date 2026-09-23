import { ImageResponse } from "next/og";
import sharp from "sharp";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export type OgCategory = "qdlb" | "vs" | "rm" | "jc";

const CATEGORY_LABEL: Record<OgCategory, string> = {
  qdlb: "Que dit la Bible ?",
  vs: "La Vie Supérieure",
  rm: "Rosée Matinale",
  jc: "Je Confesse",
};

const SITE_URL = "https://sergehapitaministries.org";
const OFFICIAL_LOGO_URL = `${SITE_URL}/logo.png`;
const FALLBACK_IMAGE: Record<OgCategory, string> = {
  rm: `${SITE_URL}/og/fallback-rm.jpg`,
  jc: `${SITE_URL}/og/fallback-jc.jpg`,
  qdlb: `${SITE_URL}/og/fallback-qdlb.jpg`,
  vs: `${SITE_URL}/og/fallback-vs.jpg`,
};

let frauncesCache: ArrayBuffer | null = null;
let manropeCache: ArrayBuffer | null = null;
const LEGACY_UA = "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36";

async function fetchGoogleFont(cssUrl: string): Promise<ArrayBuffer | null> {
  try {
    const cssRes = await fetch(cssUrl, { headers: { "User-Agent": LEGACY_UA } });
    const css = await cssRes.text();
    const latinBlock = css.match(/\/\* latin \*\/\s*@font-face\s*{[^}]*src:\s*url\(([^)]+)\)/);
    const anyBlock = css.match(/src:\s*url\(([^)]+)\)/);
    const fontUrl = latinBlock?.[1] ?? anyBlock?.[1];
    if (!fontUrl) return null;
    return await (await fetch(fontUrl)).arrayBuffer();
  } catch { return null; }
}
async function getFrauncesFont() {
  if (frauncesCache) return frauncesCache;
  frauncesCache = await fetchGoogleFont("https://fonts.googleapis.com/css2?family=Fraunces:wght@600");
  return frauncesCache;
}
async function getManropeFont() {
  if (manropeCache) return manropeCache;
  manropeCache = await fetchGoogleFont("https://fonts.googleapis.com/css2?family=Manrope:wght@700");
  return manropeCache;
}

async function prepareEditorialImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const image = await sharp(buffer).resize(620, 630, { fit: "cover", position: "attention" }).jpeg({ quality: 82 }).toBuffer();
    return `data:image/jpeg;base64,${image.toString("base64")}`;
  } catch { return null; }
}

function titleSize(title: string) {
  if (title.length > 105) return 40;
  if (title.length > 78) return 44;
  if (title.length > 52) return 50;
  if (title.length > 32) return 56;
  return 62;
}

export async function renderOgImage({
  eyebrow,
  category,
  title,
  footer,
  coverImageUrl,
}: {
  eyebrow?: string;
  category?: OgCategory;
  title: string;
  footer?: string;
  coverImageUrl?: string;
}) {
  const label = category ? CATEGORY_LABEL[category] : eyebrow || "Serge Hapita Ministries";
  const fallback = category ? FALLBACK_IMAGE[category] : null;
  const [fraunces, manrope, editorial] = await Promise.all([
    getFrauncesFont(),
    getManropeFont(),
    prepareEditorialImage(coverImageUrl || fallback || `${SITE_URL}/logo.png`),
  ]);
  const fonts = [
    fraunces && { name: "Fraunces", data: fraunces, style: "normal" as const, weight: 600 as const },
    manrope && { name: "Manrope", data: manrope, style: "normal" as const, weight: 700 as const },
  ].filter((f): f is { name: string; data: ArrayBuffer; style: "normal"; weight: 600 | 700 } => Boolean(f));

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#fbf9fd", fontFamily: manrope ? "Manrope" : "sans-serif", overflow: "hidden" }}>
      <div style={{ width: 660, height: "100%", display: "flex", flexDirection: "column", padding: "54px 62px", position: "relative", background: "linear-gradient(135deg,#fff 0%,#fbf9fd 70%,#f1ecfb 100%)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={OFFICIAL_LOGO_URL} width={235} height={79} alt="" style={{ objectFit: "contain", objectPosition: "left center" }} />
        <div style={{ display: "flex", width: 72, height: 5, background: "#b68a4b", marginTop: 28, marginBottom: 24 }} />
        <div style={{ display: "flex", color: "#6427a8", fontSize: 21, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.6, marginBottom: 22 }}>{label}</div>
        <div style={{ display: "flex", color: "#24123f", fontFamily: fraunces ? "Fraunces" : "serif", fontWeight: 600, fontSize: titleSize(title), lineHeight: 1.08, maxWidth: 520 }}>{title}</div>
        <div style={{ display: "flex", width: 86, height: 5, background: "#b68a4b", marginTop: 28 }} />
        <div style={{ position: "absolute", right: -105, top: -80, width: 220, height: 790, borderRadius: "50%", border: "38px solid rgba(111,48,165,.84)" }} />
        <div style={{ position: "absolute", right: -72, top: -55, width: 160, height: 740, borderRadius: "50%", border: "22px solid rgba(184,151,220,.52)" }} />
      </div>
      <div style={{ width: 540, height: "100%", display: "flex", background: "#ded4ec", overflow: "hidden" }}>
        {editorial ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={editorial} width={540} height={630} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", background: "linear-gradient(135deg,#e9e1f3,#6f30a5)" }} />
        )}
      </div>
    </div>,
    { ...OG_SIZE, fonts: fonts.length ? fonts : undefined }
  );
}
