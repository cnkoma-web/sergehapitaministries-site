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
    } catch (cause) {
      console.error("[admin/image-upload] image processing failed", cause);
      setError(cause instanceof Error ? cause.message : "Ce fichier n’est pas une image valide.");
      e.target.value = "";
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="admin-image-uploader">
      <div className="admin-image-uploader-layout">
        {preview && (
          <div className="admin-image-preview" style={{ aspectRatio: spec.ratio }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local d'un fichier tout juste sélectionné, pas une image du site */}
            <img src={preview} alt="Aperçu" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <div className="admin-image-controls">
          <label className="admin-file-picker">
            <span>{preview ? "Remplacer l’image" : "Choisir une image"}</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            aria-describedby="admin-image-help"
          />
          </label>
          <div id="admin-image-help" className="admin-image-help">
            Recadrage automatique au format {spec.ratioLabel} · {spec.maxFileSizeMb} Mo max.
          </div>
          {uploading && <div className="admin-upload-state" role="status"><span className="admin-button-spinner" aria-hidden="true" /> Envoi en cours…</div>}
          {warning && <div className="admin-feedback warning" role="status">{warning}</div>}
          {error && <div className="admin-feedback error" role="alert">{error}</div>}
        </div>
      </div>
    </div>
  );
}
