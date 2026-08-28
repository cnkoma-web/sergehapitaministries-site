import { createClient } from "@/lib/supabase/server";
import { addStat, updateStat, deleteStat } from "./actions";

const CALC_LABELS: Record<string, string> = {
  auto_books: "Automatique — nb. de livres",
  auto_articles: "Automatique — nb. d'articles",
  manual: "Saisie manuelle",
};

export default async function AdminStatsPage() {
  const supabase = await createClient();
  const { data: stats, error } = await supabase
    .from("stat_definitions")
    .select("id, key, label, calc_type, manual_value, active, position")
    .order("position", { ascending: true });

  return (
    <>
      <h1>Chiffres clés</h1>
      <p className="admin-lede">
        La bibliothèque de statistiques disponibles pour le bandeau de l&apos;accueil. Activez
        les cases à afficher (4 maximum recommandé pour la mise en page), ou ajoutez-en de
        nouvelles.
      </p>

      {error && (
        <div className="admin-error">
          La table n&apos;existe pas encore. Exécutez la migration SQL fournie dans le dashboard
          Supabase avant de pouvoir gérer les statistiques ici.
        </div>
      )}

      {!error && (
        <div className="items-table">
          <div className="item-row head" style={{ gridTemplateColumns: "1fr 190px 100px 60px 90px 150px" }}>
            <div>Libellé</div>
            <div>Type</div>
            <div>Val. manuelle</div>
            <div>Pos.</div>
            <div>Statut</div>
            <div>Actions</div>
          </div>
          {stats?.length === 0 && (
            <div className="item-row" style={{ gridTemplateColumns: "1fr" }}>
              <div className="admin-row-empty">Aucune statistique pour le moment.</div>
            </div>
          )}
          {stats?.map((stat) => (
            <form action={updateStat} key={stat.id} className="item-row" style={{ gridTemplateColumns: "1fr 190px 100px 60px 90px 150px" }}>
              <input type="hidden" name="id" value={stat.id} />
              <div>
                <input name="label" defaultValue={stat.label} required style={{ width: "100%", padding: "7px 10px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13.5, marginBottom: 2 }} />
                <span style={{ fontSize: 10.5, color: "var(--ink-soft)" }}>{stat.key}</span>
              </div>
              <select name="calc_type" defaultValue={stat.calc_type} style={{ padding: "7px 8px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 12.5 }}>
                {Object.entries(CALC_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input name="manual_value" defaultValue={stat.manual_value ?? ""} placeholder="—" style={{ padding: "7px 8px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13.5 }} />
              <input name="position" type="number" defaultValue={stat.position} style={{ padding: "7px 8px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13.5 }} />
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <input type="checkbox" name="active" defaultChecked={stat.active} />
                <span className={`status-badge ${stat.active ? "actif" : "masque"}`}>{stat.active ? "Actif" : "Inactif"}</span>
              </label>
              <div className="item-actions">
                <button type="submit">Enregistrer</button>
                <button type="submit" formAction={deleteStat} className="danger">
                  Suppr.
                </button>
              </div>
            </form>
          ))}
        </div>
      )}

      {!error && (
        <div className="editor-card" style={{ maxWidth: 720, marginTop: 20 }}>
          <h3>Ajouter une statistique</h3>
          <form action={addStat}>
            <div className="editor-field-row" style={{ marginBottom: 18 }}>
              <div className="editor-field" style={{ marginBottom: 0 }}>
                <label htmlFor="new-key">Clé (unique, sans espace)</label>
                <input id="new-key" name="key" placeholder="ex. villes_visitees" required />
              </div>
              <div className="editor-field" style={{ marginBottom: 0 }}>
                <label htmlFor="new-label">Libellé affiché</label>
                <input id="new-label" name="label" required />
              </div>
            </div>
            <div className="editor-field-row" style={{ marginBottom: 18 }}>
              <div className="editor-field" style={{ marginBottom: 0 }}>
                <label htmlFor="new-calc">Type</label>
                <select id="new-calc" name="calc_type" defaultValue="manual">
                  {Object.entries(CALC_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="editor-field" style={{ marginBottom: 0 }}>
                <label htmlFor="new-value">Valeur manuelle</label>
                <input id="new-value" name="manual_value" placeholder="—" />
              </div>
            </div>
            <button type="submit" className="btn-primary">
              Ajouter
            </button>
          </form>
        </div>
      )}
    </>
  );
}
