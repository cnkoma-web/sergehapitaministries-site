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
        <div className="items-table">
          <div className="item-row head" style={{ gridTemplateColumns: "260px 1fr 150px" }}>
            <div>Clé</div>
            <div>Valeur</div>
            <div>Actions</div>
          </div>
          {texts?.length === 0 && (
            <div className="item-row" style={{ gridTemplateColumns: "1fr" }}>
              <div className="admin-row-empty">Aucun texte pour le moment.</div>
            </div>
          )}
          {texts?.map((t) => (
            <form action={upsertText} key={t.id} className="item-row" style={{ gridTemplateColumns: "260px 1fr 150px" }}>
              <input type="hidden" name="id" value={t.id} />
              <input type="hidden" name="key" value={t.key} />
              <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--ink-soft)", wordBreak: "break-all" }}>{t.key}</div>
              <input name="value" defaultValue={t.value} style={{ padding: "7px 10px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13.5 }} />
              <div className="item-actions">
                <button type="submit">Enregistrer</button>
                <button type="submit" formAction={deleteText} className="danger">
                  Suppr.
                </button>
              </div>
            </form>
          ))}
        </div>
      )}

      {!error && (
        <div className="editor-card" style={{ maxWidth: 640, marginTop: 20 }}>
          <h3>Ajouter / mettre à jour une clé</h3>
          <form action={upsertText} className="editor-field-row">
            <div className="editor-field">
              <label htmlFor="new-key">Clé</label>
              <input id="new-key" name="key" placeholder="ex. footer.description" required />
            </div>
            <div className="editor-field">
              <label htmlFor="new-value">Valeur</label>
              <input id="new-value" name="value" required />
            </div>
            <button type="submit" className="admin-btn-primary" style={{ gridColumn: "1 / -1", justifySelf: "start" }}>
              Enregistrer
            </button>
          </form>
        </div>
      )}
    </>
  );
}
