import { createClient } from "@/lib/supabase/server";
import { addVideo, updateVideo, deleteVideo } from "./actions";

const CATEGORY_LABEL: Record<string, string> = {
  predications: "Prédications",
  enseignements: "Enseignements",
  temoignages: "Témoignages",
};

export default async function AdminVideosPage() {
  const supabase = await createClient();
  const { data: videos, error } = await supabase
    .from("videos")
    .select("id, title, description, category, youtube_url, position, active")
    .order("position", { ascending: true });

  return (
    <>
      <h1>Vidéos</h1>
      <p className="admin-lede">
        Chaque catégorie affiche au moins 2 emplacements sur /videos — les vidéos manquantes
        restent honnêtement marquées « à venir » tant qu&apos;elles ne sont pas ajoutées ici.
      </p>

      {error && <div className="admin-error">Impossible de charger les vidéos : {error.message}</div>}

      {videos?.map((v) => (
        <form action={updateVideo} className="admin-card" style={{ marginBottom: 16 }} key={v.id}>
          <input type="hidden" name="id" value={v.id} />
          <div className="admin-form-row">
            <div className="admin-field" style={{ flex: 2 }}>
              <label>Titre</label>
              <input name="title" defaultValue={v.title} required />
            </div>
            <div className="admin-field" style={{ flex: 1 }}>
              <label>Catégorie</label>
              <select name="category" defaultValue={v.category}>
                {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="admin-field" style={{ maxWidth: 70 }}>
              <label>Pos.</label>
              <input name="position" type="number" defaultValue={v.position} />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-field" style={{ flex: 1 }}>
              <label>Lien YouTube</label>
              <input name="youtube_url" defaultValue={v.youtube_url ?? ""} placeholder="https://www.youtube.com/watch?v=..." />
            </div>
            <div className="admin-field" style={{ flex: "0 0 auto" }}>
              <label>Statut</label>
              <label className="admin-field-checkbox">
                <input type="checkbox" name="active" defaultChecked={v.active} />
                <span className={`admin-badge ${v.active ? "active" : "inactive"}`}>{v.active ? "Actif" : "Inactif"}</span>
              </label>
            </div>
          </div>
          <div className="admin-field" style={{ marginBottom: 14 }}>
            <label>Description</label>
            <input name="description" defaultValue={v.description ?? ""} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="admin-btn-sm">Enregistrer</button>
            <button type="submit" formAction={deleteVideo} className="admin-btn-sm danger">Supprimer</button>
          </div>
        </form>
      ))}

      <div className="admin-card">
        <h3 style={{ marginBottom: 14, fontSize: 16 }}>Ajouter une vidéo</h3>
        <form action={addVideo}>
          <div className="admin-form-row">
            <div className="admin-field" style={{ flex: 2 }}>
              <label htmlFor="new-title">Titre</label>
              <input id="new-title" name="title" required />
            </div>
            <div className="admin-field" style={{ flex: 1 }}>
              <label htmlFor="new-category">Catégorie</label>
              <select id="new-category" name="category" defaultValue="predications">
                {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="admin-field" style={{ marginBottom: 14 }}>
            <label htmlFor="new-youtube">Lien YouTube</label>
            <input id="new-youtube" name="youtube_url" placeholder="https://www.youtube.com/watch?v=..." />
          </div>
          <div className="admin-field" style={{ marginBottom: 14 }}>
            <label htmlFor="new-desc">Description</label>
            <input id="new-desc" name="description" />
          </div>
          <button type="submit" className="admin-btn-primary">Ajouter</button>
        </form>
      </div>
    </>
  );
}
