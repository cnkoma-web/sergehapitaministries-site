import Link from "next/link";
import { notFound } from "next/navigation";
import { getGoodieByIdAdmin } from "@/lib/content/goodies";
import { updateGoodie, deleteGoodie } from "../actions";
import GoodieImageField from "@/components/admin/GoodieImageField";
import RichTextEditor from "@/components/admin/RichTextEditor";

export default async function AdminGoodieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const goodie = await getGoodieByIdAdmin(id);
  if (!goodie) notFound();

  return (
    <>
      <form action={updateGoodie}>
        <div className="admin-editor-topbar" style={{ margin: "-32px -40px 32px" }}>
          <div className="left">
            <Link href="/admin/boutique">← Retour à la liste</Link>
            <strong style={{ color: "var(--ink)" }}>Boutique</strong>
          </div>
          <div className="actions">
            <button type="submit" form="delete-goodie-form" className="btn-danger">
              Supprimer
            </button>
            <Link href={`/boutique/${goodie.slug}`} className="admin-btn-ghost" target="_blank">
              Aperçu
            </Link>
            <button type="submit" className="admin-btn-primary">
              Enregistrer
            </button>
          </div>
        </div>

        <input type="hidden" name="id" value={goodie.id} />

        <div className="editor-layout livre-layout">
          <div>
            <div className="editor-card">
              <h3>Photo</h3>
              <GoodieImageField currentUrl={goodie.image_url} />
            </div>

            <div className="editor-card">
              <h3>Informations générales</h3>
              <div className="editor-field">
                <label htmlFor="goodie-title">Titre</label>
                <input id="goodie-title" name="title" defaultValue={goodie.title} required />
              </div>
              <div className="editor-field-row" style={{ marginBottom: 18 }}>
                <div className="editor-field" style={{ marginBottom: 0 }}>
                  <label htmlFor="goodie-price">Prix (€)</label>
                  <input id="goodie-price" name="price" defaultValue={goodie.price_cents != null ? (goodie.price_cents / 100).toFixed(2) : ""} placeholder="—" />
                </div>
                <div className="editor-field" style={{ marginBottom: 0 }}>
                  <label htmlFor="goodie-shipping">Délai d&apos;expédition</label>
                  <input id="goodie-shipping" name="shipping_delay" defaultValue={goodie.shipping_delay ?? ""} placeholder="ex. 5-7 jours" />
                </div>
              </div>
              <div className="editor-field-row" style={{ marginBottom: 18 }}>
                <div className="editor-field" style={{ marginBottom: 0 }}>
                  <label htmlFor="goodie-sizes">Tailles (séparées par virgule)</label>
                  <input id="goodie-sizes" name="sizes" defaultValue={goodie.sizes.join(", ")} placeholder="S, M, L, XL" />
                </div>
                <div className="editor-field" style={{ marginBottom: 0 }}>
                  <label htmlFor="goodie-colors">Couleurs (codes hex, séparées par virgule)</label>
                  <input id="goodie-colors" name="colors" defaultValue={goodie.colors.join(", ")} placeholder="#1B1730, #fff" />
                </div>
              </div>
              <div className="editor-field-row" style={{ marginBottom: 18 }}>
                <div className="editor-field" style={{ marginBottom: 0 }}>
                  <label htmlFor="goodie-material">Matière</label>
                  <input id="goodie-material" name="material" defaultValue={goodie.material ?? ""} />
                </div>
                <div className="editor-field" style={{ marginBottom: 0 }}>
                  <label htmlFor="goodie-cut">Coupe</label>
                  <input id="goodie-cut" name="cut" defaultValue={goodie.cut ?? ""} />
                </div>
              </div>
              <div className="editor-field">
                <label htmlFor="goodie-care">Entretien</label>
                <input id="goodie-care" name="care" defaultValue={goodie.care ?? ""} />
              </div>
              <div className="editor-field">
                <label htmlFor="goodie-fabrication">Fabrication</label>
                <input id="goodie-fabrication" name="fabrication" defaultValue={goodie.fabrication ?? ""} placeholder="À la demande" />
              </div>
            </div>

            <div className="editor-card">
              <h3>Description</h3>
              <RichTextEditor key={goodie.id} name="description" defaultValue={goodie.description} placeholder="Description du produit…" compact minHeight={110} />
            </div>
          </div>

          <div>
            <div className="editor-card">
              <h3>Statut de publication</h3>
              <div className="status-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
                <label>
                  <input type="radio" name="status" value="available" defaultChecked={goodie.status === "available"} />{" "}
                  <span className="status-badge actif">Disponible</span>
                </label>
                <label>
                  <input type="radio" name="status" value="coming_soon" defaultChecked={goodie.status === "coming_soon"} />{" "}
                  <span className="status-badge precommande">Bientôt disponible</span>
                </label>
              </div>
              <div style={{ marginTop: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
                  <input type="checkbox" name="active" defaultChecked={goodie.active} /> Visible sur le site
                </label>
              </div>
            </div>

            <div className="editor-card">
              <h3>Position d&apos;affichage</h3>
              <div className="editor-field" style={{ marginBottom: 0 }}>
                <label htmlFor="goodie-position">Dans la boutique</label>
                <input id="goodie-position" name="position" type="number" defaultValue={goodie.position} />
              </div>
            </div>
          </div>
        </div>
      </form>

      <form id="delete-goodie-form" action={deleteGoodie}>
        <input type="hidden" name="id" value={goodie.id} />
      </form>
    </>
  );
}
