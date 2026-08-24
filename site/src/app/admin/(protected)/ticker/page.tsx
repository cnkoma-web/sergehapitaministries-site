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
        <div className="admin-card">
          {messages?.length === 0 && <div className="admin-row-empty">Aucun message pour le moment.</div>}
          {messages?.map((msg) => (
            <form action={updateTickerMessage} key={msg.id} className="admin-row">
              <input type="hidden" name="id" value={msg.id} />
              <div className="admin-field" style={{ flex: 3 }}>
                <label>Texte</label>
                <input name="text" defaultValue={msg.text} required />
              </div>
              <div className="admin-field" style={{ flex: 2 }}>
                <label>Lien</label>
                <input name="href" defaultValue={msg.href ?? ""} placeholder="(aucun)" />
              </div>
              <div className="admin-field" style={{ maxWidth: 70 }}>
                <label>Pos.</label>
                <input name="position" type="number" defaultValue={msg.position} />
              </div>
              <div className="admin-field" style={{ flex: "0 0 auto" }}>
                <label>Statut</label>
                <label className="admin-field-checkbox">
                  <input type="checkbox" name="active" defaultChecked={msg.active} />
                  <span className={`admin-badge ${msg.active ? "active" : "inactive"}`}>
                    {msg.active ? "Actif" : "Inactif"}
                  </span>
                </label>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="admin-btn-sm">
                  Enregistrer
                </button>
                <button type="submit" formAction={deleteTickerMessage} className="admin-btn-sm danger">
                  Supprimer
                </button>
              </div>
            </form>
          ))}
        </div>
      )}

      {!error && (
        <div className="admin-card">
          <h3 style={{ marginBottom: 14, fontSize: 16 }}>Ajouter un message</h3>
          <form action={addTickerMessage}>
            <div className="admin-form-row">
              <div className="admin-field" style={{ flex: 3 }}>
                <label htmlFor="new-text">Texte</label>
                <input id="new-text" name="text" required />
              </div>
              <div className="admin-field" style={{ flex: 2 }}>
                <label htmlFor="new-href">Lien (optionnel)</label>
                <input id="new-href" name="href" placeholder="/livres" />
              </div>
              <div className="admin-field" style={{ flex: 0, minWidth: 80 }}>
                <label htmlFor="new-position">Position</label>
                <input id="new-position" name="position" type="number" defaultValue={messages?.length ?? 0} />
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
