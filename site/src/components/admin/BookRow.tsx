"use client";

import { useState } from "react";
import ImageUploader from "./ImageUploader";

export type BookRowData = {
  id: string;
  title: string;
  badge: string | null;
  price_cents: number | null;
  cover_url: string | null;
  format: string | null;
  pages: number | null;
  isbn: string | null;
  description: string | null;
  position: number;
  active: boolean;
};

type Props = {
  book: BookRowData;
  updateAction: (formData: FormData) => void;
  deleteAction: (formData: FormData) => void;
};

// Ligne d'édition d'un livre dans /admin/livres. L'upload de couverture est géré
// en state React (ImageUploader) puis reporté dans un input caché du formulaire
// natif au moment de la soumission — un <form> ne peut pas "attendre" une action
// asynchrone déclenchée par un composant enfant autrement.
export default function BookRow({ book, updateAction, deleteAction }: Props) {
  const [coverUrl, setCoverUrl] = useState(book.cover_url);

  return (
    <form action={updateAction} className="admin-card" style={{ marginBottom: 16 }}>
      <input type="hidden" name="id" value={book.id} />
      <input type="hidden" name="cover_url" value={coverUrl ?? ""} />

      <div className="admin-form-row">
        <ImageUploader bucket="book-covers" currentUrl={coverUrl} onUploaded={(url) => setCoverUrl(url)} />
      </div>

      <div className="admin-form-row">
        <div className="admin-field" style={{ flex: 2 }}>
          <label>Titre</label>
          <input name="title" defaultValue={book.title} required />
        </div>
        <div className="admin-field" style={{ flex: 1 }}>
          <label>Badge</label>
          <input name="badge" defaultValue={book.badge ?? ""} placeholder="ex. Nouveauté" />
        </div>
        <div className="admin-field" style={{ maxWidth: 100 }}>
          <label>Prix (€)</label>
          <input name="price" defaultValue={book.price_cents != null ? (book.price_cents / 100).toFixed(2) : ""} placeholder="—" />
        </div>
        <div className="admin-field" style={{ maxWidth: 70 }}>
          <label>Pos.</label>
          <input name="position" type="number" defaultValue={book.position} />
        </div>
      </div>

      <div className="admin-form-row">
        <div className="admin-field" style={{ flex: 1 }}>
          <label>Format</label>
          <input name="format" defaultValue={book.format ?? ""} placeholder="ex. 13 × 20 cm" />
        </div>
        <div className="admin-field" style={{ maxWidth: 100 }}>
          <label>Pages</label>
          <input name="pages" type="number" defaultValue={book.pages ?? ""} />
        </div>
        <div className="admin-field" style={{ flex: 1 }}>
          <label>ISBN</label>
          <input name="isbn" defaultValue={book.isbn ?? ""} placeholder="À renseigner" />
        </div>
        <div className="admin-field" style={{ flex: "0 0 auto" }}>
          <label>Statut</label>
          <label className="admin-field-checkbox">
            <input type="checkbox" name="active" defaultChecked={book.active} />
            <span className={`admin-badge ${book.active ? "active" : "inactive"}`}>
              {book.active ? "Actif" : "Inactif"}
            </span>
          </label>
        </div>
      </div>

      <div className="admin-field" style={{ marginBottom: 14 }}>
        <label>Description</label>
        <textarea name="description" defaultValue={book.description ?? ""} rows={3} />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" className="admin-btn-sm">Enregistrer</button>
        <button type="submit" formAction={deleteAction} className="admin-btn-sm danger">Supprimer</button>
      </div>
    </form>
  );
}
