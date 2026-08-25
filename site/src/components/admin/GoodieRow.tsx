"use client";

import { useState } from "react";
import ImageUploader from "./ImageUploader";

export type GoodieRowData = {
  id: string;
  title: string;
  price_cents: number | null;
  image_url: string | null;
  sizes: string[];
  colors: string[];
  material: string | null;
  cut: string | null;
  care: string | null;
  fabrication: string | null;
  shipping_delay: string | null;
  status: string;
  position: number;
  active: boolean;
};

type Props = {
  goodie: GoodieRowData;
  updateAction: (formData: FormData) => void;
  deleteAction: (formData: FormData) => void;
};

export default function GoodieRow({ goodie, updateAction, deleteAction }: Props) {
  const [imageUrl, setImageUrl] = useState(goodie.image_url);

  return (
    <form action={updateAction} className="admin-card" style={{ marginBottom: 16 }}>
      <input type="hidden" name="id" value={goodie.id} />
      <input type="hidden" name="image_url" value={imageUrl ?? ""} />

      <div className="admin-form-row">
        <ImageUploader bucket="product-photos" currentUrl={imageUrl} onUploaded={(url) => setImageUrl(url)} />
      </div>

      <div className="admin-form-row">
        <div className="admin-field" style={{ flex: 2 }}>
          <label>Titre</label>
          <input name="title" defaultValue={goodie.title} required />
        </div>
        <div className="admin-field" style={{ maxWidth: 100 }}>
          <label>Prix (€)</label>
          <input name="price" defaultValue={goodie.price_cents != null ? (goodie.price_cents / 100).toFixed(2) : ""} placeholder="—" />
        </div>
        <div className="admin-field" style={{ flex: 1 }}>
          <label>Statut</label>
          <select name="status" defaultValue={goodie.status}>
            <option value="coming_soon">Bientôt disponible</option>
            <option value="available">Disponible</option>
          </select>
        </div>
        <div className="admin-field" style={{ maxWidth: 70 }}>
          <label>Pos.</label>
          <input name="position" type="number" defaultValue={goodie.position} />
        </div>
      </div>

      <div className="admin-form-row">
        <div className="admin-field" style={{ flex: 1 }}>
          <label>Tailles (séparées par virgule)</label>
          <input name="sizes" defaultValue={goodie.sizes.join(", ")} placeholder="S, M, L, XL" />
        </div>
        <div className="admin-field" style={{ flex: 1 }}>
          <label>Couleurs (codes hex, séparés par virgule)</label>
          <input name="colors" defaultValue={goodie.colors.join(", ")} placeholder="#1B1730, #fff, #7B3FE4" />
        </div>
      </div>

      <div className="admin-form-row">
        <div className="admin-field" style={{ flex: 1 }}>
          <label>Matière</label>
          <input name="material" defaultValue={goodie.material ?? ""} placeholder="Coton bio" />
        </div>
        <div className="admin-field" style={{ flex: 1 }}>
          <label>Coupe</label>
          <input name="cut" defaultValue={goodie.cut ?? ""} />
        </div>
        <div className="admin-field" style={{ flex: 1 }}>
          <label>Entretien</label>
          <input name="care" defaultValue={goodie.care ?? ""} />
        </div>
      </div>

      <div className="admin-form-row">
        <div className="admin-field" style={{ flex: 1 }}>
          <label>Fabrication</label>
          <input name="fabrication" defaultValue={goodie.fabrication ?? ""} placeholder="À la demande" />
        </div>
        <div className="admin-field" style={{ flex: 1 }}>
          <label>Délai d&apos;expédition</label>
          <input name="shipping_delay" defaultValue={goodie.shipping_delay ?? ""} />
        </div>
        <div className="admin-field" style={{ flex: "0 0 auto" }}>
          <label>Actif</label>
          <label className="admin-field-checkbox">
            <input type="checkbox" name="active" defaultChecked={goodie.active} />
            <span className={`admin-badge ${goodie.active ? "active" : "inactive"}`}>
              {goodie.active ? "Actif" : "Inactif"}
            </span>
          </label>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" className="admin-btn-sm">Enregistrer</button>
        <button type="submit" formAction={deleteAction} className="admin-btn-sm danger">Supprimer</button>
      </div>
    </form>
  );
}
