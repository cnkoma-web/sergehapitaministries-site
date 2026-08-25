import { createClient } from "@/lib/supabase/server";
import GoodieRow from "@/components/admin/GoodieRow";
import { addGoodie, updateGoodie, deleteGoodie } from "./actions";

export default async function AdminBoutiquePage() {
  const supabase = await createClient();
  const { data: goodies, error } = await supabase
    .from("goodies")
    .select("id, title, price_cents, image_url, sizes, colors, material, cut, care, fabrication, shipping_delay, status, position, active")
    .order("position", { ascending: true });

  return (
    <>
      <h1>Boutique</h1>
      <p className="admin-lede">
        Les goodies affichés sur /boutique. Photo au ratio 1:1 recommandé.
      </p>

      {error && <div className="admin-error">Impossible de charger la boutique : {error.message}</div>}

      {goodies?.map((g) => (
        <GoodieRow key={g.id} goodie={g} updateAction={updateGoodie} deleteAction={deleteGoodie} />
      ))}

      <div className="admin-card">
        <h3 style={{ marginBottom: 14, fontSize: 16 }}>Ajouter un goodie</h3>
        <form action={addGoodie}>
          <div className="admin-form-row">
            <div className="admin-field" style={{ flex: 2 }}>
              <label htmlFor="new-title">Titre</label>
              <input id="new-title" name="title" required />
            </div>
            <div className="admin-field" style={{ maxWidth: 100 }}>
              <label htmlFor="new-price">Prix (€)</label>
              <input id="new-price" name="price" placeholder="—" />
            </div>
            <div className="admin-field" style={{ flex: 1 }}>
              <label htmlFor="new-status">Statut</label>
              <select id="new-status" name="status" defaultValue="coming_soon">
                <option value="coming_soon">Bientôt disponible</option>
                <option value="available">Disponible</option>
              </select>
            </div>
            <div className="admin-field" style={{ maxWidth: 70 }}>
              <label htmlFor="new-position">Pos.</label>
              <input id="new-position" name="position" type="number" defaultValue={goodies?.length ?? 0} />
            </div>
          </div>
          <button type="submit" className="admin-btn-primary">Ajouter</button>
        </form>
      </div>
    </>
  );
}
