import Link from "next/link";
import { notFound } from "next/navigation";
import { getBookByIdAdmin, getBookImages } from "@/lib/content/books";
import { updateBook, deleteBook } from "../actions";
import BookGallery from "@/components/admin/BookGallery";
import RichTextEditor from "@/components/admin/RichTextEditor";

export default async function AdminLivreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [book, images] = await Promise.all([getBookByIdAdmin(id), getBookImages(id)]);
  if (!book) notFound();

  return (
    <>
      <div className="admin-editor-topbar" style={{ margin: "-32px -40px 32px" }}>
        <div className="left">
          <Link href="/admin/livres">← Retour à la liste</Link>
          <strong style={{ color: "var(--ink)" }}>Livres</strong>
        </div>
        <div className="actions">
          <form action={deleteBook}>
            <input type="hidden" name="id" value={book.id} />
            <button type="submit" className="btn-danger">
              Supprimer
            </button>
          </form>
          <Link href={`/livres/${book.slug}`} className="admin-btn-ghost" target="_blank">
            Aperçu
          </Link>
          <button type="submit" form="book-form" className="admin-btn-primary">
            Enregistrer
          </button>
        </div>
      </div>

      <form id="book-form" action={updateBook} className="editor-layout livre-layout">
        <input type="hidden" name="id" value={book.id} />

        <div>
          <BookGallery bookId={book.id} initialImages={images} />

          <div className="editor-card">
            <h3>Informations générales</h3>
            <div className="editor-field">
              <label htmlFor="book-title">Titre</label>
              <input id="book-title" name="title" defaultValue={book.title} required />
            </div>
            <div className="editor-field-row" style={{ marginBottom: 18 }}>
              <div className="editor-field" style={{ marginBottom: 0 }}>
                <label htmlFor="book-price">Prix (€)</label>
                <input id="book-price" name="price" defaultValue={book.price_cents != null ? (book.price_cents / 100).toFixed(2) : ""} placeholder="—" />
              </div>
              <div className="editor-field" style={{ marginBottom: 0 }}>
                <label htmlFor="book-badge">Badge</label>
                <input id="book-badge" name="badge" defaultValue={book.badge ?? ""} placeholder="ex. Nouveauté" />
              </div>
            </div>
            <div className="editor-field-row" style={{ marginBottom: 18 }}>
              <div className="editor-field" style={{ marginBottom: 0 }}>
                <label htmlFor="book-format">Format</label>
                <input id="book-format" name="format" defaultValue={book.format ?? ""} placeholder="ex. 13 x 20 cm" />
              </div>
              <div className="editor-field" style={{ marginBottom: 0 }}>
                <label htmlFor="book-pages">Pages</label>
                <input id="book-pages" name="pages" type="number" defaultValue={book.pages ?? ""} />
              </div>
            </div>
            <div className="editor-field-row">
              <div className="editor-field" style={{ marginBottom: 0 }}>
                <label htmlFor="book-isbn">ISBN</label>
                <input id="book-isbn" name="isbn" defaultValue={book.isbn ?? ""} placeholder="À renseigner" />
              </div>
              <div className="editor-field" style={{ marginBottom: 0 }}>
                <label htmlFor="book-language">Langue</label>
                <input id="book-language" name="language" defaultValue={book.language ?? "Français"} />
              </div>
            </div>
          </div>

          <div className="editor-card">
            <h3>Description</h3>
            <RichTextEditor key={book.id} name="description" defaultValue={book.description} placeholder="Description du livre…" compact minHeight={110} />
          </div>
        </div>

        <div>
          <div className="editor-card">
            <h3>Statut de publication</h3>
            <div className="status-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
              <label>
                <input type="radio" name="status" value="active" defaultChecked={book.status === "active"} />{" "}
                <span className="status-badge actif">Actif</span> — disponible à l&apos;achat
              </label>
              <label>
                <input type="radio" name="status" value="precommande" defaultChecked={book.status === "precommande"} />{" "}
                <span className="status-badge precommande">Précommande</span> — pas encore livrable
              </label>
              <label>
                <input type="radio" name="status" value="hidden" defaultChecked={book.status === "hidden"} /> Masqué — invisible
                sur le site
              </label>
            </div>
          </div>

          <div className="editor-card">
            <h3>Position d&apos;affichage</h3>
            <div className="editor-field" style={{ marginBottom: 0 }}>
              <label htmlFor="book-position">Dans le catalogue général</label>
              <input id="book-position" name="position" type="number" defaultValue={book.position} />
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
