import { getCategories } from "@/lib/content/categories";
import { addCategory, renameCategory, deleteCategory } from "./actions";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <>
      <h1>Catégories</h1>
      <p className="admin-lede">
        Les thèmes utilisés pour classer vos publications (indépendants de Que Dit la Bible / La
        Vie Supérieure / Rosée Matinale, qui restent des types fixes). Renommer une catégorie ici
        met à jour tous les articles qui l&apos;utilisent.
      </p>

      <div className="editor-card" style={{ maxWidth: 480 }}>
        {categories.length === 0 && <div className="admin-row-empty">Aucune catégorie pour le moment.</div>}
        {categories.map((c) => (
          <form action={renameCategory} key={c.id} className="admin-row">
            <input type="hidden" name="id" value={c.id} />
            <input name="name" defaultValue={c.name} style={{ flex: 1, padding: "8px 10px", border: "1.5px solid var(--line)", borderRadius: 8 }} />
            <button type="submit" className="admin-btn-sm">
              Renommer
            </button>
            <button type="submit" formAction={deleteCategory} className="admin-btn-sm danger">
              Supprimer
            </button>
          </form>
        ))}

        <h3 style={{ margin: "20px 0 12px", fontSize: 15 }}>Ajouter une catégorie</h3>
        <form action={addCategory} style={{ display: "flex", gap: 8 }}>
          <input name="name" placeholder="ex. Identité de fils" required style={{ flex: 1, padding: "9px 11px", border: "1px solid var(--line)", borderRadius: 6 }} />
          <button type="submit" className="btn-primary">
            Ajouter
          </button>
        </form>
      </div>
    </>
  );
}
