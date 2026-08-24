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
        <div className="admin-card">
          {stats?.map((stat) => (
            <form action={updateStat} key={stat.id} className="admin-row">
              <input type="hidden" name="id" value={stat.id} />
              <div className="admin-field" style={{ flex: 2 }}>
                <label>Libellé</label>
                <input name="label" defaultValue={stat.label} required />
                <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>{stat.key}</span>
              </div>
              <div className="admin-field" style={{ flex: 2 }}>
                <label>Type</label>
                <select name="calc_type" defaultValue={stat.calc_type}>
                  {Object.entries(CALC_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-field" style={{ maxWidth: 100 }}>
                <label>Valeur manuelle</label>
                <input name="manual_value" defaultValue={stat.manual_value ?? ""} placeholder="—" />
              </div>
              <div className="admin-field" style={{ maxWidth: 70 }}>
                <label>Pos.</label>
                <input name="position" type="number" defaultValue={stat.position} />
              </div>
              <div className="admin-field" style={{ flex: "0 0 auto" }}>
                <label>Statut</label>
                <label className="admin-field-checkbox">
                  <input type="checkbox" name="active" defaultChecked={stat.active} />
                  <span className={`admin-badge ${stat.active ? "active" : "inactive"}`}>
                    {stat.active ? "Actif" : "Inactif"}
                  </span>
                </label>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="admin-btn-sm">
                  Enregistrer
                </button>
                <button type="submit" formAction={deleteStat} className="admin-btn-sm danger">
                  Supprimer
                </button>
              </div>
            </form>
          ))}
        </div>
      )}

      {!error && (
        <div className="admin-card">
          <h3 style={{ marginBottom: 14, fontSize: 16 }}>Ajouter une statistique</h3>
          <form action={addStat}>
            <div className="admin-form-row">
              <div className="admin-field" style={{ flex: 2 }}>
                <label htmlFor="new-key">Clé (unique, sans espace)</label>
                <input id="new-key" name="key" placeholder="ex. villes_visitees" required />
              </div>
              <div className="admin-field" style={{ flex: 2 }}>
                <label htmlFor="new-label">Libellé affiché</label>
                <input id="new-label" name="label" required />
              </div>
              <div className="admin-field" style={{ flex: 2 }}>
                <label htmlFor="new-calc">Type</label>
                <select id="new-calc" name="calc_type" defaultValue="manual">
                  {Object.entries(CALC_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-field" style={{ flex: 1 }}>
                <label htmlFor="new-value">Valeur manuelle</label>
                <input id="new-value" name="manual_value" placeholder="—" />
              </div>
            </div>
            <button type="submit" className="admin-btn-primary">
              Ajouter
            </button>
          </form>
        </div>
      )}
    </>
  );
}
