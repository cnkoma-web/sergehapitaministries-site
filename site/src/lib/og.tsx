import { ImageResponse } from "next/og";

// Visuels de partage social générés à la volée (cahier Partie 5 §6.7) — plus de
// chemins statiques /assets/og/*.jpg qui n'existent pas (d'où l'absence
// d'image lors d'un partage WhatsApp/Facebook). Un seul gabarit partagé, dans
// le style du site (dégradé bleu/violet, même charte), paramétré par
// eyebrow/titre — appelé depuis chaque fichier `opengraph-image.tsx`.

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const BLUE = "#2E2FE0";
const PURPLE = "#7B3FE4";
const LAVENDER_DEEP = "#EAE6F9";

export function renderOgImage({ eyebrow, title, footer }: { eyebrow?: string; title: string; footer?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: `linear-gradient(120deg, ${BLUE} 0%, ${PURPLE} 100%)`,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {eyebrow && (
            <div
              style={{
                display: "flex",
                color: LAVENDER_DEEP,
                fontSize: 28,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 4,
                marginBottom: 28,
              }}
            >
              {eyebrow}
            </div>
          )}
          <div
            style={{
              display: "flex",
              color: "#fff",
              fontSize: title.length > 60 ? 52 : 64,
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: 980,
            }}
          >
            {title}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", color: "#fff", fontSize: 32, fontWeight: 700 }}>
            Serge Hapita <span style={{ fontWeight: 400, marginLeft: 8 }}>Ministries</span>
          </div>
          {footer && <div style={{ display: "flex", color: "rgba(255,255,255,.75)", fontSize: 24 }}>{footer}</div>}
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
