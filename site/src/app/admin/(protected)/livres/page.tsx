import { createClient } from "@/lib/supabase/server";
import BookRow from "@/components/admin/BookRow";
import { addBook, updateBook, deleteBook } from "./actions";

export default async function AdminLivresPage() {
  const supabase = await createClient();
  const { data: books, error } = await supabase
    .from("books")
    .select("id, title, badge, price_cents, cover_url, format, pages, isbn, description, position, active")
    .order("position", { ascending: true });

  return (
    <>
      <h1>Livres</h1>
      <p className="admin-lede">
        Le catalogue affiché sur /livres. La couverture doit respecter un ratio 2:3 — un
        avertissement s&apos;affiche sinon.
      </p>

      {error && <div className="admin-error">Impossible de charger les livres : {error.message}</div>}

      {books?.map((book) => (
        <BookRow key={book.id} book={book} updateAction={updateBook} deleteAction={deleteBook} />
      ))}

      <div className="admin-card">
        <h3 style={{ marginBottom: 14, fontSize: 16 }}>Ajouter un livre</h3>
        <form action={addBook}>
          <div className="admin-form-row">
            <div className="admin-field" style={{ flex: 2 }}>
              <label htmlFor="new-title">Titre</label>
              <input id="new-title" name="title" required />
            </div>
            <div className="admin-field" style={{ flex: 1 }}>
              <label htmlFor="new-badge">Badge</label>
              <input id="new-badge" name="badge" placeholder="ex. Nouveauté" />
            </div>
            <div className="admin-field" style={{ maxWidth: 100 }}>
              <label htmlFor="new-price">Prix (€)</label>
              <input id="new-price" name="price" placeholder="15.00" />
            </div>
            <div className="admin-field" style={{ maxWidth: 70 }}>
              <label htmlFor="new-position">Pos.</label>
              <input id="new-position" name="position" type="number" defaultValue={books?.length ?? 0} />
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 14 }}>
            La couverture, le format, les pages, l&apos;ISBN et la description se complètent
            ensuite en modifiant la fiche ci-dessus.
          </p>
          <button type="submit" className="admin-btn-primary">Ajouter</button>
        </form>
      </div>
    </>
  );
}
