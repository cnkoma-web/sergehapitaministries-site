import { ImageResponse } from "next/og";

// Visuels de partage social générés à la volée (cahier Partie 5 §6.7) — plus de
// chemins statiques /assets/og/*.jpg qui n'existent pas (d'où l'absence
// d'image lors d'un partage WhatsApp/Facebook). Un seul gabarit partagé, dans
// le style du site, paramétré par catégorie/eyebrow/titre — appelé depuis
// chaque fichier `opengraph-image.tsx`.
//
// Retour du 05/09 (2e passage) — identité visuelle renforcée : logo du site
// intégré (plus un simple nom en texte), dégradé propre à chaque catégorie de
// publication (violet Que Dit la Bible, bleu La Vie Supérieure, sarcelle
// Rosée Matinale — mêmes couleurs que les capsules .feed-badge sur le site),
// et polices de marque (Fraunces pour le titre, Manrope pour le reste) au
// lieu de la police système générique. Satori (le moteur derrière
// ImageResponse) ne sait pas lire une police via un <link> Google Fonts
// comme une page web — il lui faut les octets bruts de la police. Les
// polices ne sont jamais servies en WOFF2 (compression que Satori ne sait
// pas décoder) à un navigateur identifié comme trop ancien pour le
// supporter — se faire passer pour un tel navigateur (getFontData ci-dessous)
// est la façon standard d'obtenir un format que Satori sait lire.

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const INK = "#1B1730";
const BLUE = "#2E2FE0";
const PURPLE = "#7B3FE4";
const TEAL = "#3D6E86";
const LAVENDER_DEEP = "#EAE6F9";
const LOGO_URL = "https://sergehapitaministries.org/logo.png";

// Mêmes couleurs que .feed-badge.qdlb/.vs/.rm dans globals.css — la capsule
// de catégorie sur le site et celle de l'image de partage doivent se
// répondre visuellement.
export type OgCategory = "qdlb" | "vs" | "rm";
const CATEGORY_COLOR: Record<OgCategory, string> = { qdlb: PURPLE, vs: BLUE, rm: TEAL };
const CATEGORY_LABEL: Record<OgCategory, string> = { qdlb: "Que Dit la Bible ?", vs: "La Vie Supérieure", rm: "Rosée Matinale" };

// Cache mémoire au niveau du module (retour du 05/09) — réutilisé d'un appel
// à l'autre tant que l'instance de fonction serverless reste "chaude" (le cas
// normal sur Vercel entre deux partages proches dans le temps) : une seule
// vraie requête réseau vers Google Fonts par démarrage à froid, pas une par
// image générée.
//
// Bug corrigé en vérifiant (retour du 05/09) : la première version
// demandait la police déjà réduite aux caractères du premier titre rendu
// (`&text=...`), puis réutilisait ce sous-ensemble tel quel pour tous les
// titres suivants via le cache — un deuxième article dont le titre contient
// des lettres absentes du premier voyait ces lettres basculer sur Manrope
// (l'autre police chargée), un mélange visible en plein milieu d'un mot
// (constaté en direct : "qui son" en sans-serif au milieu d'un titre en
// Fraunces). Il faut la police complète, pas un sous-ensemble par titre,
// pour que le cache reste valable d'un article à l'autre.
let frauncesCache: ArrayBuffer | null = null;
let manropeCache: ArrayBuffer | null = null;

// User-Agent d'un navigateur trop ancien pour WOFF2 (retour du 05/09) —
// Google Fonts sert alors la police en WOFF classique, un format que Satori
// sait décoder (contrairement à WOFF2, compressé en Brotli).
const LEGACY_UA = "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36";

async function fetchGoogleFont(cssUrl: string): Promise<ArrayBuffer | null> {
  try {
    const cssRes = await fetch(cssUrl, { headers: { "User-Agent": LEGACY_UA } });
    const css = await cssRes.text();
    // Une police complète (sans &text=) revient en PLUSIEURS blocs
    // @font-face, un par plage Unicode (vietnamese, latin-ext, latin...) —
    // il faut précisément celui commenté "latin" (couvre le français, y
    // compris les caractères accentués via Latin-1 Supplement), pas le
    // premier bloc rencontré (systématiquement "vietnamese" en tête,
    // inutilisable tel quel : bug trouvé en vérifiant le rendu réel).
    const latinBlock = css.match(/\/\* latin \*\/\s*@font-face\s*{[^}]*src:\s*url\(([^)]+)\)/);
    const anyBlock = css.match(/src:\s*url\(([^)]+)\)/);
    const fontUrl = latinBlock?.[1] ?? anyBlock?.[1];
    if (!fontUrl) return null;
    const fontRes = await fetch(fontUrl);
    return await fontRes.arrayBuffer();
  } catch {
    // Une police introuvable ne doit jamais empêcher l'image de partage
    // d'exister — juste un repli sur la police système (voir renderOgImage).
    return null;
  }
}

async function getFrauncesFont(): Promise<ArrayBuffer | null> {
  if (frauncesCache) return frauncesCache;
  frauncesCache = await fetchGoogleFont("https://fonts.googleapis.com/css2?family=Fraunces:wght@600");
  return frauncesCache;
}

async function getManropeFont(): Promise<ArrayBuffer | null> {
  if (manropeCache) return manropeCache;
  manropeCache = await fetchGoogleFont("https://fonts.googleapis.com/css2?family=Manrope:wght@700");
  return manropeCache;
}

export async function renderOgImage({
  eyebrow,
  category,
  title,
  footer,
}: {
  eyebrow?: string;
  category?: OgCategory;
  title: string;
  footer?: string;
}) {
  const accent = category ? CATEGORY_COLOR[category] : PURPLE;
  const badgeLabel = category ? CATEGORY_LABEL[category] : eyebrow;
  const gradient = category
    ? `linear-gradient(135deg, ${accent} 0%, ${INK} 100%)`
    : `linear-gradient(120deg, ${BLUE} 0%, ${PURPLE} 100%)`;

  const [fraunces, manrope] = await Promise.all([getFrauncesFont(), getManropeFont()]);
  const fonts = [
    fraunces && { name: "Fraunces", data: fraunces, style: "normal" as const, weight: 600 as const },
    manrope && { name: "Manrope", data: manrope, style: "normal" as const, weight: 700 as const },
  ].filter((f): f is { name: string; data: ArrayBuffer; style: "normal"; weight: 600 | 700 } => Boolean(f));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: gradient,
          fontFamily: manrope ? "Manrope" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_URL} width={200} height={75} alt="" style={{ marginBottom: 40, objectFit: "contain" }} />
          {badgeLabel && (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                background: "#fff",
                color: accent,
                fontSize: 22,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 2,
                padding: "10px 22px",
                borderRadius: 999,
                marginBottom: 32,
              }}
            >
              {badgeLabel}
            </div>
          )}
          <div
            style={{
              display: "flex",
              color: "#fff",
              fontFamily: fraunces ? "Fraunces" : "sans-serif",
              fontWeight: 600,
              fontSize: title.length > 60 ? 50 : 62,
              lineHeight: 1.15,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", color: LAVENDER_DEEP, fontSize: 26, fontWeight: 700 }}>sergehapitaministries.org</div>
          {footer && <div style={{ display: "flex", color: "rgba(255,255,255,.75)", fontSize: 24 }}>{footer}</div>}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts.length > 0 ? fonts : undefined }
  );
}
