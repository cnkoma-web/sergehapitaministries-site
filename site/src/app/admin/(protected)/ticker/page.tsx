import { createClient } from "@/lib/supabase/server";
import { addTickerMessage, updateTickerMessage, deleteTickerMessage } from "./actions";

export default async function AdminTickerPage() {
  const supabase = await createClient();
  const { data: messages, error } = await supabase
    .from("ticker_messages")
    .select("id, text, href, position, active")
    .order("position", { ascending: true });

  return (
    <>
      <h1>Bandeau ticker</h1>
      <p className="admin-lede">
        Les phrases qui défilent en boucle en haut de chaque page. Aucune limite de nombre —
        l&apos;ordre d&apos;affichage suit la position (0 en premier).
      </p>

      {error && (
        <div className="admin-error">
          La table n&apos;existe pas encore. Exécutez la migration SQL fournie dans le dashboard
          Supabase (Project → SQL Editor) avant de pouvoir gérer le ticker ici.
        </div>
      )}

      {!error && (
        <div className="items-table">
          <div className="item-row head" style={{ gridTemplateColumns: "1fr 180px 60px 90px 150px" }}>
            <div>Texte</div>
            <div>Lien</div>
            <div>Pos.</div>
            <div>Statut</div>
            <div>Actions</div>
          </div>
          {messages?.length === 0 && (
            <div className="item-row" style={{ gridTemplateColumns: "1fr" }}>
              <div className="admin-row-empty">Aucun message pour le moment.</div>
            </div>
          )}
          {messages?.map((msg) => (
            <form action={updateTickerMessage} key={msg.id} className="item-row" style={{ gridTemplateColumns: "1fr 180px 60px 90px 150px" }}>
              <input type="hidden" name="id" value={msg.id} />
              <input name="text" defaultValue={msg.text} required style={{ padding: "7px 10px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13.5 }} />
              <input name="href" defaultValue={msg.href ?? ""} placeholder="(aucun)" style={{ padding: "7px 10px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13 }} />
              <input name="position" type="number" defaultValue={msg.position} style={{ padding: "7px 8px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13.5 }} />
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <input type="checkbox" name="active" defaultChecked={msg.active} />
                <span className={`status-badge ${msg.active ? "actif" : "masque"}`}>{msg.active ? "Actif" : "Inactif"}</span>
              </label>
              <div className="item-actions">
                <button type="submit">Enregistrer</button>
                <button type="submit" formAction={deleteTickerMessage} className="danger">
                  Suppr.
                </button>
              </div>
            </form>
          ))}
        </div>
      )}

      {!error && (
        <div className="editor-card" style={{ maxWidth: 640, marginTop: 20 }}>
          <h3>Ajouter un message</h3>
          <form action={addTickerMessage}>
            <div className="editor-field-row" style={{ marginBottom: 18, gridTemplateColumns: "2fr 2fr 1fr" }}>
              <div className="editor-field" style={{ marginBottom: 0 }}>
                <label htmlFor="new-text">Texte</label>
                <input id="new-text" name="text" required />
              </div>
              <div className="editor-field" style={{ marginBottom: 0 }}>
                <label htmlFor="new-href">Lien (optionnel)</label>
                <input id="new-href" name="href" placeholder="/livres" />
              </div>
              <div className="editor-field" style={{ marginBottom: 0 }}>
                <label htmlFor="new-position">Position</label>
                <input id="new-position" name="position" type="number" defaultValue={messages?.length ?? 0} />
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
