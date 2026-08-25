import { createClient } from "@/lib/supabase/server";
import { publishRosee, updateRosee, deleteRosee } from "./actions";

export default async function AdminRoseePage() {
  const supabase = await createClient();
  const { data: entries, error } = await supabase
    .from("articles")
    .select("id, article_date, verse_text, body, status, reading_time_minutes")
    .eq("type", "rm")
    .order("article_date", { ascending: false });

  const today = new Date().toISOString().slice(0, 10);
  const alreadyPublishedToday = entries?.some((e) => e.article_date === today);

  return (
    <>
      <h1>Rosée Matinale</h1>
      <p className="admin-lede">
        Publier une nouvelle entrée bascule automatiquement l&apos;ancienne en archive — pas de
        bouton séparé, c&apos;est juste la plus récente entrée par date (cahier §3.2).
      </p>

      {error && <div className="admin-error">Impossible de charger les entrées : {error.message}</div>}

      <div className="admin-card">
        <h3 style={{ marginBottom: 14, fontSize: 16 }}>
          {alreadyPublishedToday ? "Une entrée existe déjà pour aujourd'hui" : "Publier l'entrée du jour"}
        </h3>
        <form action={publishRosee}>
          <div className="admin-form-row">
            <div className="admin-field" style={{ maxWidth: 180 }}>
              <label>Date</label>
              <input name="article_date" type="date" defaultValue={today} required />
            </div>
          </div>
          <div className="admin-field" style={{ marginBottom: 14 }}>
            <label>Citation / pensée du jour</label>
            <textarea name="verse_text" rows={3} required />
          </div>
          <div className="admin-field" style={{ marginBottom: 14 }}>
            <label>Corps (développement, séparé en paragraphes par une ligne vide)</label>
            <textarea name="body" rows={6} />
          </div>
          <button type="submit" className="admin-btn-primary">Publier</button>
        </form>
      </div>

      <h3 style={{ margin: "28px 0 12px" }}>Entrées existantes</h3>
      {entries?.map((e) => (
        <form action={updateRosee} className="admin-card" style={{ marginBottom: 16 }} key={e.id}>
          <input type="hidden" name="id" value={e.id} />
          <div className="admin-form-row">
            <div className="admin-field" style={{ maxWidth: 160 }}>
              <label>Date</label>
              <input value={e.article_date} disabled />
            </div>
            <div className="admin-field" style={{ flex: 1 }}>
              <label>Statut</label>
              <select name="status" defaultValue={e.status}>
                <option value="published">Publié</option>
                <option value="draft">Brouillon</option>
              </select>
            </div>
          </div>
          <div className="admin-field" style={{ marginBottom: 14 }}>
            <label>Citation / pensée</label>
            <textarea name="verse_text" defaultValue={e.verse_text ?? ""} rows={2} />
          </div>
          <div className="admin-field" style={{ marginBottom: 14 }}>
            <label>Corps {e.reading_time_minutes ? `(≈ ${e.reading_time_minutes} min de lecture)` : ""}</label>
            <textarea name="body" defaultValue={e.body ?? ""} rows={5} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="admin-btn-sm">Enregistrer</button>
            <button type="submit" formAction={deleteRosee} className="admin-btn-sm danger">Supprimer</button>
          </div>
        </form>
      ))}
    </>
  );
}
