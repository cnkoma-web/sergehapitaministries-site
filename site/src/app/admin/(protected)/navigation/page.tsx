import { createClient } from "@/lib/supabase/server";
import { addNavItem, updateNavItem, deleteNavItem } from "./actions";
import { getLinkableResources } from "@/lib/content/linkableResources";
import LinkPicker from "@/components/admin/LinkPicker";

type NavRow = { id: string; parent_id: string | null; label: string; href: string | null; position: number };

const ROW_COLS = "1fr 1fr 60px 150px";

export default async function AdminNavigationPage() {
  const supabase = await createClient();
  const [{ data, error }, linkGroups] = await Promise.all([
    supabase.from("nav_items").select("id, parent_id, label, href, position").order("position", { ascending: true }),
    getLinkableResources(),
  ]);

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
        <div className="items-table">
          <div className="item-row head" style={{ gridTemplateColumns: ROW_COLS }}>
            <div>Libellé</div>
            <div>Adresse</div>
            <div>Pos.</div>
            <div>Actions</div>
          </div>

          {topLevel.length === 0 && (
            <div className="item-row" style={{ gridTemplateColumns: "1fr" }}>
              <div className="admin-row-empty">Aucun élément pour le moment.</div>
            </div>
          )}

          {topLevel.map((item) => {
            const children = childrenOf(item.id);
            const isDropdown = !item.href;
            return (
              <div key={item.id}>
                <form action={updateNavItem} className="item-row" style={{ gridTemplateColumns: ROW_COLS, background: isDropdown ? "var(--lavender)" : undefined }}>
                  <input type="hidden" name="id" value={item.id} />
                  <input name="label" defaultValue={item.label} required style={{ padding: "7px 10px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13.5, fontWeight: 600 }} />
                  <LinkPicker name="href" groups={linkGroups} currentValue={item.href} allowNone />
                  <input name="position" type="number" defaultValue={item.position} style={{ padding: "7px 8px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13.5 }} />
                  <div className="item-actions">
                    <button type="submit">Enregistrer</button>
                    <button type="submit" formAction={deleteNavItem} className="danger">
                      Suppr.
                    </button>
                  </div>
                </form>

                {isDropdown &&
                  children.map((child) => (
                    <form action={updateNavItem} key={child.id} className="item-row" style={{ gridTemplateColumns: ROW_COLS, paddingLeft: 32 }}>
                      <input type="hidden" name="id" value={child.id} />
                      <input name="label" defaultValue={child.label} required style={{ padding: "7px 10px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13 }} />
                      <LinkPicker name="href" groups={linkGroups} currentValue={child.href} />
                      <input name="position" type="number" defaultValue={child.position} style={{ padding: "7px 8px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13.5 }} />
                      <div className="item-actions">
                        <button type="submit">Enregistrer</button>
                        <button type="submit" formAction={deleteNavItem} className="danger">
                          Suppr.
                        </button>
                      </div>
                    </form>
                  ))}

                {isDropdown && (
                  <form action={addNavItem} className="item-row" style={{ gridTemplateColumns: ROW_COLS, paddingLeft: 32 }}>
                    <input type="hidden" name="parent_id" value={item.id} />
                    <input name="label" placeholder="+ Libellé du sous-lien" required style={{ padding: "7px 10px", border: "1px dashed var(--line)", borderRadius: 6, fontSize: 13 }} />
                    <LinkPicker name="href" groups={linkGroups} currentValue={null} />
                    <div />
                    <div className="item-actions">
                      <button type="submit">Ajouter</button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!error && (
        <div className="editor-card" style={{ maxWidth: 640, marginTop: 20 }}>
          <h3>Ajouter un élément au menu</h3>
          <form action={addNavItem} className="editor-field-row" style={{ gridTemplateColumns: "2fr 2fr" }}>
            <div className="editor-field">
              <label>Libellé</label>
              <input name="label" required />
            </div>
            <div className="editor-field">
              <label>Adresse (laisser vide pour un menu déroulant)</label>
              <LinkPicker name="href" groups={linkGroups} currentValue={null} allowNone />
            </div>
            <button type="submit" className="btn-primary" style={{ gridColumn: "1 / -1", justifySelf: "start" }}>
              Ajouter
            </button>
          </form>
        </div>
      )}
    </>
  );
}
