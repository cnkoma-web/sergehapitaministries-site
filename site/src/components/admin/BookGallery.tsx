"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { cropImageToRatio } from "@/lib/upload/cropImage";
import { addBookImage, removeBookImage, reorderBookImages } from "@/app/admin/(protected)/livres/actions";

export type GalleryImage = { id: string; url: string; position: number };

const MAX_IMAGES = 5;

export default function BookGallery({ bookId, initialImages }: { bookId: string; initialImages: GalleryImage[] }) {
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const cropped = await cropImageToRatio(file, 2 / 3);
      const supabase = createClient();
      const path = `${crypto.randomUUID()}.${file.type === "image/png" ? "png" : "jpg"}`;
      const { error: uploadError } = await supabase.storage.from("book-covers").upload(path, cropped, {
        cacheControl: "31536000",
        upsert: false,
      });
      if (uploadError) {
        setError(`Échec de l'envoi : ${uploadError.message}`);
        return;
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from("book-covers").getPublicUrl(path);

      const formData = new FormData();
      formData.set("book_id", bookId);
      formData.set("url", publicUrl);
      const created = await addBookImage(formData);
      if (created) setImages((prev) => [...prev, created]);
      else setError("Échec de l'enregistrement de l'image.");
    } catch {
      setError("Ce fichier n'est pas une image valide.");
    } finally {
      setUploading(false);
    }
  }

  function handleRemove(imageId: string) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("image_id", imageId);
      formData.set("book_id", bookId);
      await removeBookImage(formData);
      setImages((prev) => prev.filter((img) => img.id !== imageId).map((img, i) => ({ ...img, position: i })));
    });
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    const reordered = [...images];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    setImages(reordered.map((img, i) => ({ ...img, position: i })));
    setDragIndex(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("book_id", bookId);
      formData.set("ordered_ids", reordered.map((img) => img.id).join(","));
      await reorderBookImages(formData);
    });
  }

  const slots = Array.from({ length: MAX_IMAGES }, (_, i) => images[i] ?? null);

  return (
    <div className="editor-card">
      <h3>Galerie d&apos;images (jusqu&apos;à 5, glisser pour réordonner)</h3>
      <div className="gallery-grid">
        {slots.map((img, i) =>
          img ? (
            <div
              key={img.id}
              className="gallery-slot filled"
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)}
            >
              <span className="pos-badge">{i + 1}</span>
              <button type="button" className="remove-slot" onClick={() => handleRemove(img.id)} aria-label="Retirer cette image">
                ×
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={`Image ${i + 1}`} />
              <span className="drag-handle">⠿</span>
            </div>
          ) : (
            <button
              key={`empty-${i}`}
              type="button"
              className="gallery-slot"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? "Envoi…" : "+ Ajouter"}
            </button>
          )
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
      {error && <div className="admin-error" style={{ marginTop: 10 }}>{error}</div>}
      <p className="gallery-hint">
        Position 1 = couverture avant (utilisée dans le catalogue et les partages). Les autres
        positions (dos, tranche, intérieur...) s&apos;affichent en galerie sur la fiche du livre.
        Recadrage automatique au format 2:3.
      </p>
    </div>
  );
}
