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
  rm: `${SITE_URL}/og/fallback-rm.svg`,
  jc: `${SITE_URL}/og/fallback-jc.svg`,
  qdlb: `${SITE_URL}/og/fallback-qdlb.svg`,
  vs: `${SITE_URL}/og/fallback-vs.svg`,
};

let dmSerifCache: ArrayBuffer | null = null;
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
async function getDmSerifFont() {
  if (dmSerifCache) return dmSerifCache;
  dmSerifCache = await fetchGoogleFont("https://fonts.googleapis.com/css2?family=DM+Serif+Display");
  return dmSerifCache;
}
async function getManropeFont() {
  if (manropeCache) return manropeCache;
  manropeCache = await fetchGoogleFont("https://fonts.googleapis.com/css2?family=Manrope:wght@700");
  return manropeCache;
}

async function prepareEditorialImage(url: string, width = 620): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const image = await sharp(buffer).resize(width, 630, { fit: "cover", position: "attention" }).jpeg({ quality: 82 }).toBuffer();
    return `data:image/jpeg;base64,${image.toString("base64")}`;
  } catch { return null; }
}

function titleSize(title: string) {
  if (title.length > 105) return 38;
  if (title.length > 78) return 42;
  if (title.length > 52) return 48;
  if (title.length > 32) return 54;
  return 60;
}

function rmTitleSize(title: string) {
  if (title.length > 90) return 40;
  if (title.length > 68) return 44;
  if (title.length > 50) return 48;
  if (title.length > 34) return 54;
  return 60;
}

async function renderRoseeMatinaleV1(title: string, coverImageUrl?: string) {
  const [dmSerif, manrope, editorial] = await Promise.all([
    getDmSerifFont(),
    getManropeFont(),
    prepareEditorialImage(coverImageUrl || FALLBACK_IMAGE.rm, 700),
  ]);
  const fonts = [
    dmSerif && { name: "DM Serif Display", data: dmSerif, style: "normal" as const, weight: 400 as const },
    manrope && { name: "Manrope", data: manrope, style: "normal" as const, weight: 700 as const },
  ].filter((f): f is { name: string; data: ArrayBuffer; style: "normal"; weight: 600 | 700 } => Boolean(f));

  return new ImageResponse(
    <div style={{ width: 1200, height: 630, display: "flex", position: "relative", overflow: "hidden", background: "#fbfafc" }}>
      {editorial ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={editorial} width={700} height={630} alt="" style={{ position: "absolute", right: 0, top: 0, width: 700, height: 630, objectFit: "cover" }} />
      ) : null}

      <svg width="720" height="630" viewBox="0 0 720 630" style={{ position: "absolute", left: 0, top: 0 }}>
        <path d="M0 0H500C505 105 552 171 573 258C601 374 574 486 404 630H0Z" fill="#fbfafc" />
        <path d="M500 0C507 106 552 174 574 260C603 375 577 489 405 630H487C603 500 634 386 607 267C586 175 551 102 548 0Z" fill="#6f30a5" />
        <path d="M548 0C552 102 587 175 608 267C635 386 604 500 488 630H551C648 505 675 391 648 270C628 178 599 105 598 0Z" fill="#a77bd0" fill-opacity=".72" />
        <path d="M598 0C600 104 629 178 649 270C676 391 649 505 552 630H610C687 510 709 395 683 273C665 181 642 106 642 0Z" fill="#6f30a5" fill-opacity=".55" />
      </svg>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={OFFICIAL_LOGO_URL} width={305} height={102} alt="" style={{ position: "absolute", left: 80, top: 50, objectFit: "contain", objectPosition: "left center" }} />
      <div style={{ position: "absolute", left: 82, top: 224, width: 88, height: 5, display: "flex", background: "#b68a4b" }} />
      <div style={{ position: "absolute", left: 82, top: 261, display: "flex", color: "#6427a8", fontFamily: manrope ? "Manrope" : "sans-serif", fontSize: 22, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>Rosée Matinale</div>
      <div style={{ position: "absolute", left: 82, top: 310, width: 445, maxHeight: 220, display: "flex", color: "#24123f", fontFamily: dmSerif ? "DM Serif Display" : "serif", fontWeight: 400, fontSize: rmTitleSize(title), lineHeight: 1.08 }}>{title}</div>
      <div style={{ position: "absolute", left: 82, top: 542, width: 88, height: 5, display: "flex", background: "#b68a4b" }} />
    </div>,
    { ...OG_SIZE, fonts: fonts.length ? fonts : undefined }
  );
}

async function renderJeConfesseV1(title: string, coverImageUrl?: string) {
  const [dmSerif, manrope, editorial] = await Promise.all([
    getDmSerifFont(),
    getManropeFont(),
    prepareEditorialImage(coverImageUrl || FALLBACK_IMAGE.jc, 700),
  ]);
  const fonts = [
    dmSerif && { name: "DM Serif Display", data: dmSerif, style: "normal" as const, weight: 400 as const },
    manrope && { name: "Manrope", data: manrope, style: "normal" as const, weight: 700 as const },
  ].filter((f): f is { name: string; data: ArrayBuffer; style: "normal"; weight: 600 | 700 } => Boolean(f));

  return new ImageResponse(
    <div style={{ width: 1200, height: 630, display: "flex", position: "relative", overflow: "hidden", background: "#fbfafc" }}>
      {editorial ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={editorial} width={700} height={630} alt="" style={{ position: "absolute", right: 0, top: 0, width: 700, height: 630, objectFit: "cover" }} />
      ) : null}
      <svg width="720" height="630" viewBox="0 0 720 630" style={{ position: "absolute", left: 0, top: 0 }}>
        <path d="M0 0H500C505 105 552 171 573 258C601 374 574 486 404 630H0Z" fill="#fbfafc" />
        <path d="M500 0C507 106 552 174 574 260C603 375 577 489 405 630H487C603 500 634 386 607 267C586 175 551 102 548 0Z" fill="#6f30a5" />
        <path d="M548 0C552 102 587 175 608 267C635 386 604 500 488 630H551C648 505 675 391 648 270C628 178 599 105 598 0Z" fill="#a77bd0" fill-opacity=".72" />
        <path d="M598 0C600 104 629 178 649 270C676 391 649 505 552 630H610C687 510 709 395 683 273C665 181 642 106 642 0Z" fill="#6f30a5" fill-opacity=".55" />
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={OFFICIAL_LOGO_URL} width={305} height={102} alt="" style={{ position: "absolute", left: 80, top: 50, objectFit: "contain", objectPosition: "left center" }} />
      <div style={{ position: "absolute", left: 82, top: 224, width: 88, height: 5, display: "flex", background: "#b68a4b" }} />
      <div style={{ position: "absolute", left: 82, top: 261, display: "flex", color: "#6427a8", fontFamily: manrope ? "Manrope" : "sans-serif", fontSize: 22, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>Je Confesse</div>
      <div style={{ position: "absolute", left: 82, top: 310, width: 445, maxHeight: 220, display: "flex", color: "#24123f", fontFamily: dmSerif ? "DM Serif Display" : "serif", fontWeight: 400, fontSize: rmTitleSize(title), lineHeight: 1.08 }}>{title}</div>
      <div style={{ position: "absolute", left: 82, top: 542, width: 88, height: 5, display: "flex", background: "#b68a4b" }} />
    </div>,
    { ...OG_SIZE, fonts: fonts.length ? fonts : undefined }
  );
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
  if (category === "rm") return renderRoseeMatinaleV1(title, coverImageUrl);
  if (category === "jc") return renderJeConfesseV1(title, coverImageUrl);

  const label = category ? CATEGORY_LABEL[category] : eyebrow || "Serge Hapita Ministries";
  const fallback = category ? FALLBACK_IMAGE[category] : null;
  const [dmSerif, manrope, editorial] = await Promise.all([
    getDmSerifFont(),
    getManropeFont(),
    prepareEditorialImage(coverImageUrl || fallback || `${SITE_URL}/logo.png`),
  ]);
  const fonts = [
    dmSerif && { name: "DM Serif Display", data: dmSerif, style: "normal" as const, weight: 400 as const },
    manrope && { name: "Manrope", data: manrope, style: "normal" as const, weight: 700 as const },
  ].filter((f): f is { name: string; data: ArrayBuffer; style: "normal"; weight: 600 | 700 } => Boolean(f));

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#fbf9fd", fontFamily: manrope ? "Manrope" : "sans-serif", overflow: "hidden" }}>
      <div style={{ width: 610, height: "100%", display: "flex", flexDirection: "column", padding: "52px 78px", position: "relative", background: "linear-gradient(135deg,#fff 0%,#fbf9fd 70%,#f1ecfb 100%)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={OFFICIAL_LOGO_URL} width={285} height={96} alt="" style={{ objectFit: "contain", objectPosition: "left center" }} />
        <div style={{ display: "flex", width: 88, height: 5, background: "#b68a4b", marginTop: 24, marginBottom: 22 }} />
        <div style={{ display: "flex", color: "#6427a8", fontSize: 21, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.4, marginBottom: 24 }}>{label}</div>
        <div style={{ display: "flex", color: "#24123f", fontFamily: dmSerif ? "DM Serif Display" : "serif", fontWeight: 600, fontSize: titleSize(title), lineHeight: 1.08, maxWidth: 455 }}>{title}</div>
        <div style={{ display: "flex", width: 88, height: 5, background: "#b68a4b", marginTop: 28 }} />
        <div style={{ position: "absolute", right: -128, top: -92, width: 250, height: 820, borderRadius: "50%", border: "42px solid rgba(111,48,165,.88)" }} />
        <div style={{ position: "absolute", right: -86, top: -64, width: 182, height: 770, borderRadius: "50%", border: "24px solid rgba(184,151,220,.55)" }} />
      </div>
      <div style={{ width: 590, height: "100%", display: "flex", background: "#ded4ec", overflow: "hidden" }}>
        {editorial ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={editorial} width={590} height={630} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", background: "linear-gradient(135deg,#e9e1f3,#6f30a5)" }} />
        )}
      </div>
    </div>,
    { ...OG_SIZE, fonts: fonts.length ? fonts : undefined }
  );
}
