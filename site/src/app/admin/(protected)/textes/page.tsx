import { createClient } from "@/lib/supabase/server";
import { upsertText, deleteText } from "./actions";

export default async function AdminTextesPage() {
  const supabase = await createClient();
  const { data: texts, error } = await supabase
    .from("interface_texts")
    .select("id, key, value")
    .order("key", { ascending: true });

  return (
    <>
      <h1>Textes globaux</h1>
      <p className="admin-lede">
        Libellés de navigation, description et liens du footer. Le contenu propre à chaque
        page (titres, boutons) sera ajouté ici au fur et à mesure de la migration des pages.
      </p>

      {error && (
        <div className="admin-error">
          La table n&apos;existe pas encore. Exécutez la migration SQL fournie dans le dashboard
          Supabase avant de pouvoir gérer les textes ici.
        </div>
      )}

      {!error && (
        <div className="admin-card">
          {texts?.map((t) => (
            <form action={upsertText} key={t.id} className="admin-row">
              <input type="hidden" name="id" value={t.id} />
              <input type="hidden" name="key" value={t.key} />
              <div className="admin-field" style={{ flex: "0 0 260px" }}>
                <label>Clé</label>
                <span style={{ fontFamily: "monospace", fontSize: 12.5 }}>{t.key}</span>
              </div>
              <div className="admin-field" style={{ flex: 1 }}>
                <label>Valeur</label>
                <input name="value" defaultValue={t.value} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="admin-btn-sm">
                  Enregistrer
                </button>
                <button type="submit" formAction={deleteText} className="admin-btn-sm danger">
                  Supprimer
                </button>
              </div>
            </form>
          ))}
        </div>
      )}

      {!error && (
        <div className="admin-card">
          <h3 style={{ marginBottom: 14, fontSize: 16 }}>Ajouter / mettre à jour une clé</h3>
          <form action={upsertText}>
            <div className="admin-form-row">
              <div className="admin-field" style={{ flex: 1 }}>
                <label htmlFor="new-key">Clé</label>
                <input id="new-key" name="key" placeholder="ex. footer.description" required />
              </div>
              <div className="admin-field" style={{ flex: 2 }}>
                <label htmlFor="new-value">Valeur</label>
                <input id="new-value" name="value" required />
              </div>
            </div>
            <button type="submit" className="admin-btn-primary">
              Enregistrer
            </button>
          </form>
        </div>
      )}
    </>
  );
}
