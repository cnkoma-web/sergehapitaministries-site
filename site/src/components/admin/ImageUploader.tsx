"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { IMAGE_SPECS, checkImageDimensions, readImageDimensions, type ImageBucket } from "@/lib/upload/imageSpecs";

type Props = {
  bucket: ImageBucket;
  /** URL publique actuelle, si une image est déjà associée (mode édition). */
  currentUrl?: string | null;
  /** Appelé avec l'URL publique une fois l'upload terminé. */
  onUploaded: (publicUrl: string, path: string) => void;
};

// Composant d'upload réutilisable pour toute image devant respecter un ratio fixe
// (couvertures de livres 2:3, photos produits 1:1 — cahier §1.4). Le ratio est
// vérifié côté client avant l'envoi : une image non conforme est rejetée avec un
// message clair, jamais déformée ni acceptée silencieusement.
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

    let dimensions: { width: number; height: number };
    try {
      dimensions = await readImageDimensions(file);
    } catch {
      setError("Ce fichier n'est pas une image valide.");
      e.target.value = "";
      return;
    }

    const result = checkImageDimensions(spec, dimensions.width, dimensions.height);
    if (!result.ok) {
      setError(result.reason);
      e.target.value = "";
      return;
    }
    if (result.warning) setWarning(result.warning);

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
      });

      if (uploadError) {
        setError(`Échec de l'envoi : ${uploadError.message}`);
        setUploading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(path);

      onUploaded(publicUrl, path);
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
            Format attendu : {spec.ratioLabel}, {spec.minWidth}×{spec.minHeight}px minimum
            conseillé, {spec.maxFileSizeMb} Mo max.
          </div>
          {uploading && <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 6 }}>Envoi en cours…</div>}
          {warning && <div className="admin-error" style={{ background: "#FFF6E0", color: "#8A6D1D", marginTop: 8 }}>{warning}</div>}
          {error && <div className="admin-error" style={{ marginTop: 8 }}>{error}</div>}
        </div>
      </div>
    </div>
  );
}
