"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { IMAGE_SPECS, readImageDimensions, type ImageBucket } from "@/lib/upload/imageSpecs";
import { cropImageToRatio } from "@/lib/upload/cropImage";

type Props = {
  bucket: ImageBucket;
  /** URL publique actuelle, si une image est déjà associée (mode édition). */
  currentUrl?: string | null;
  /** Appelé avec l'URL publique une fois l'upload terminé. */
  onUploaded: (publicUrl: string, path: string) => void;
};

// Composant d'upload réutilisable pour toute image devant respecter un ratio fixe
// (couvertures de livres 2:3, photos produits 1:1 — cahier §1.4). Recadrage
// automatique et silencieux au centre si l'image envoyée n'est pas déjà au bon
// ratio (cahier Partie 5 §6.4) — jamais de blocage ni d'avertissement de ratio :
// Serge envoie l'image telle qu'il l'a, le système s'adapte.
export default function ImageUploader({ bucket, currentUrl, onUploaded }: Props) {
  const spec = IMAGE_SPECS[bucket];
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError(null);
    setWarning(null);
    if (!file) return;

    if (file.size > spec.maxFileSizeMb * 1024 * 1024) {
      setError(`Ce fichier pèse trop lourd (max ${spec.maxFileSizeMb} Mo).`);
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const dimensions = await readImageDimensions(file);
      if (dimensions.width < spec.minWidth || dimensions.height < spec.minHeight) {
        setWarning(
          `Cette image (${dimensions.width}×${dimensions.height}) est plus petite que la résolution recommandée (${spec.minWidth}×${spec.minHeight}) — elle sera acceptée, mais risque de paraître floue en grand écran.`
        );
      }

      const cropped = await cropImageToRatio(file, spec.ratio);
      setPreview(URL.createObjectURL(cropped));

      const supabase = createClient();
      const ext = file.type === "image/png" ? "png" : "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, cropped, {
        cacheControl: "31536000",
        upsert: false,
      });

      if (uploadError) {
        setError(`Échec de l'envoi : ${uploadError.message}`);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(path);

      onUploaded(publicUrl, path);
    } catch {
      setError("Ce fichier n'est pas une image valide.");
      e.target.value = "";
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {preview && (
          <div
            style={{
              width: 100,
              aspectRatio: spec.ratio,
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid var(--line)",
              flexShrink: 0,
              background: "var(--lavender)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local d'un fichier tout juste sélectionné, pas une image du site */}
            <img src={preview} alt="Aperçu" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 6 }}>
            Recadrage automatique au format {spec.ratioLabel} · {spec.maxFileSizeMb} Mo max.
          </div>
          {uploading && <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 6 }}>Envoi en cours…</div>}
          {warning && <div className="admin-error" style={{ background: "#FFF6E0", color: "#8A6D1D", marginTop: 8 }}>{warning}</div>}
          {error && <div className="admin-error" style={{ marginTop: 8 }}>{error}</div>}
        </div>
      </div>
    </div>
  );
}
