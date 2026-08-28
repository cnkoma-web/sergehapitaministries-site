import { createClient } from "@/lib/supabase/server";
import { addNavItem, updateNavItem, deleteNavItem } from "./actions";

type NavRow = { id: string; parent_id: string | null; label: string; href: string | null; position: number };

export default async function AdminNavigationPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("nav_items")
    .select("id, parent_id, label, href, position")
    .order("position", { ascending: true });

  const items = (data ?? []) as NavRow[];
  const topLevel = items.filter((i) => !i.parent_id);
  const childrenOf = (id: string) => items.filter((i) => i.parent_id === id);

  return (
    <>
      <h1>Menu de navigation</h1>
      <p className="admin-lede">
        Le menu principal du site. Un lien avec une adresse est un lien direct ; un lien laissé
        sans adresse devient un menu déroulant — ajoutez alors ses liens en dessous.
      </p>

      {error && (
        <div className="admin-error">
          La table n&apos;existe pas encore. Exécutez la migration SQL fournie dans le dashboard
          Supabase avant de pouvoir gérer le menu ici.
        </div>
      )}

      {!error && (
        <>
          <div className="admin-card">
            {topLevel.length === 0 && <div className="admin-row-empty">Aucun élément pour le moment.</div>}
            {topLevel.map((item) => {
              const children = childrenOf(item.id);
              const isDropdown = !item.href;
              return (
                <div key={item.id} style={{ borderBottom: "1px solid var(--line)", padding: "14px 0" }}>
                  <form action={updateNavItem} className="admin-row" style={{ borderBottom: 0, padding: 0 }}>
                    <input type="hidden" name="id" value={item.id} />
                    <div className="admin-field" style={{ flex: 2 }}>
                      <label>Libellé</label>
                      <input name="label" defaultValue={item.label} required />
                    </div>
                    <div className="admin-field" style={{ flex: 2 }}>
                      <label>Adresse {isDropdown ? "(vide = menu déroulant)" : ""}</label>
                      <input name="href" defaultValue={item.href ?? ""} placeholder="ex. /contact" />
                    </div>
                    <div className="admin-field" style={{ maxWidth: 70 }}>
                      <label>Pos.</label>
                      <input name="position" type="number" defaultValue={item.position} />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="submit" className="admin-btn-sm">
                        Enregistrer
                      </button>
                      <button type="submit" formAction={deleteNavItem} className="admin-btn-sm danger">
                        Supprimer
                      </button>
                    </div>
                  </form>

                  {isDropdown && (
                    <div style={{ marginLeft: 28, marginTop: 10 }}>
                      {children.map((child) => (
                        <form action={updateNavItem} key={child.id} className="admin-row" style={{ padding: "8px 0" }}>
                          <input type="hidden" name="id" value={child.id} />
                          <div className="admin-field" style={{ flex: 2 }}>
                            <input name="label" defaultValue={child.label} required placeholder="Libellé" />
                          </div>
                          <div className="admin-field" style={{ flex: 2 }}>
                            <input name="href" defaultValue={child.href ?? ""} required placeholder="/adresse" />
                          </div>
                          <div className="admin-field" style={{ maxWidth: 70 }}>
                            <input name="position" type="number" defaultValue={child.position} />
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button type="submit" className="admin-btn-sm">
                              Enregistrer
                            </button>
                            <button type="submit" formAction={deleteNavItem} className="admin-btn-sm danger">
                              Suppr.
                            </button>
                          </div>
                        </form>
                      ))}
                      <form action={addNavItem} style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <input type="hidden" name="parent_id" value={item.id} />
                        <input name="label" placeholder="Libellé du sous-lien" required style={{ flex: 1, padding: "7px 10px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13 }} />
                        <input name="href" placeholder="/adresse" required style={{ flex: 1, padding: "7px 10px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13 }} />
                        <button type="submit" className="admin-btn-sm">
                          + Ajouter dans {item.label}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="editor-card" style={{ maxWidth: 640 }}>
            <h3>Ajouter un élément au menu</h3>
            <form action={addNavItem} className="admin-form-row">
              <div className="admin-field" style={{ flex: 2 }}>
                <label>Libellé</label>
                <input name="label" required />
              </div>
              <div className="admin-field" style={{ flex: 2 }}>
                <label>Adresse (laisser vide pour un menu déroulant)</label>
                <input name="href" placeholder="ex. /contact" />
              </div>
              <button type="submit" className="admin-btn-primary">
                Ajouter
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
}
