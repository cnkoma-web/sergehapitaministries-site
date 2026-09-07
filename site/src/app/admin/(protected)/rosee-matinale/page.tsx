import Link from "next/link";
import { getArticlesAdmin } from "@/lib/content/articles";
import { publishRosee, deleteArticle } from "../publications/actions";
import Pagination from "@/components/admin/Pagination";
import ArticleCoverField from "@/components/admin/ArticleCoverField";
import RichTextEditor from "@/components/admin/RichTextEditor";

const STATUS_LABEL: Record<string, string> = { draft: "Brouillon", published: "Publié" };
const STATUS_CLASS: Record<string, string> = { draft: "masque", published: "actif" };

export default async function AdminRoseePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; perPage?: string }>;
}) {
  const { page: pageParam, perPage: perPageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  // 5 par page maximum (retour du 06/09) — la liste montait jusqu'à 20
  // entrées d'un coup, bien plus longue que nécessaire pour une liste
  // consultée quotidiennement. Même principe de pagination que l'archive
  // publique (voir ARCHIVE_PER_PAGE dans RoseeMatinaleContent.tsx), sans
  // reprendre son nombre par page (3, pensé pour une grille de cartes plutôt
  // que cette liste tabulaire).
  const perPage = Number(perPageParam) || 5;

  const { articles: entries, total } = await getArticlesAdmin(["rm"], page, perPage);
  const today = new Date().toISOString().slice(0, 10);
  const alreadyPublishedToday = entries.some((e) => e.article_date === today);

  return (
    <>
      <h1>Rosée Matinale</h1>
      <p className="admin-lede">
        Publier une nouvelle entrée bascule automatiquement l&apos;ancienne en archive — pas de
        bouton séparé, c&apos;est juste la plus récente entrée par date (cahier §3.2). L&apos;archive
        complète se modifie comme un article classique (éditeur détaillé).
      </p>

      {/* Centré, même disposition que l'écran d'édition (retour du 07/09,
          unification des deux éditeurs) — jusqu'ici, la création utilisait
          encore une disposition différente (pleine largeur) et un simple
          <textarea> sans mise en forme pour le corps, plutôt que le même
          RichTextEditor déjà utilisé pour modifier une entrée existante
          (bouton "Citation mise en exergue" compris). Un seul éditeur pour
          les deux cas, jamais deux versions différentes à maintenir. */}
      <div className="editor-card" style={{ maxWidth: 720, margin: "0 auto" }}>
        <h3>{alreadyPublishedToday ? "Une entrée existe déjà pour aujourd'hui" : "Publier l'entrée du jour"}</h3>
        <form action={publishRosee}>
          <div className="editor-field" style={{ maxWidth: 220 }}>
            <label>Date</label>
            <input name="article_date" type="date" defaultValue={today} required />
          </div>
          {/* Titre (retour du 07/09) — facultatif : laissé vide, l'entrée
              garde le titre reconstruit automatiquement depuis la date
              ("Rosée Matinale — [date]"), comme avant ce champ. Utilisé dans
              la liste "Articles similaires" de l'éditeur et dans le message
              de partage personnalisé (voir src/lib/share.ts). */}
          <div className="editor-field">
            <label>Titre (facultatif)</label>
            <input type="text" name="title" placeholder="Repli automatique : « Rosée Matinale — [date] »" />
          </div>
          <div className="editor-field">
            <label>Citation / pensée du jour</label>
            <textarea name="verse_text" rows={3} required />
          </div>
          <div className="editor-field">
            <label>Corps (développement, facultatif)</label>
            <RichTextEditor name="body" placeholder="Développement facultatif…" minHeight={160} compact />
          </div>
          <div className="editor-field">
            <label>Image de couverture</label>
            <ArticleCoverField currentUrl={null} />
            <input type="text" name="cover_alt" placeholder="Texte alternatif (description de l'image)" style={{ marginTop: 8 }} />
          </div>
          <div className="editor-field">
            <label>Mots-clés (SEO) — séparés par des virgules</label>
            <input type="text" name="seo_keywords" placeholder="repos, identité, confiance en Dieu" />
          </div>
          <button type="submit" className="admin-btn-primary">
            Publier
          </button>
        </form>
      </div>

      <h3 style={{ margin: "28px 0 12px" }}>Entrées existantes</h3>
      <div className="items-table">
        {/* Aperçu élargi 130px→220px et Actions 90px→150px (retour du 06/09,
            2e passage) — l'extrait de 60 caractères était compressé dans une
            colonne bien trop étroite, et "Suppr." dépassait la largeur de la
            table (overflow:hidden sur .items-table), à moitié invisible. */}
        <div className="item-row head" style={{ gridTemplateColumns: "1fr 220px 110px 150px" }}>
          <div>Date</div>
          <div>Aperçu</div>
          <div>Statut</div>
          <div>Actions</div>
        </div>
        {entries.length === 0 && (
          <div className="item-row" style={{ gridTemplateColumns: "1fr" }}>
            <div className="admin-row-empty">Aucune entrée pour le moment.</div>
          </div>
        )}
        {entries.map((e) => (
          <div className="item-row" key={e.id} style={{ gridTemplateColumns: "1fr 220px 110px 150px" }}>
            <div className="item-title">
              <Link href={`/admin/rosee-matinale/${e.id}`}>{new Date(e.article_date).toLocaleDateString("fr-FR")}</Link>
              <span>{e.reading_time_minutes ? `≈ ${e.reading_time_minutes} min de lecture` : ""}</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{(e.verse_text ?? "").slice(0, 60)}</div>
            <div>
              <span className={`status-badge ${STATUS_CLASS[e.status]}`}>{STATUS_LABEL[e.status]}</span>
            </div>
            <div className="item-actions">
              <Link href={`/admin/rosee-matinale/${e.id}`}>Éditer</Link>
              <form action={deleteArticle}>
                <input type="hidden" name="id" value={e.id} />
                <input type="hidden" name="redirectTo" value="/admin/rosee-matinale" />
                <button type="submit" className="danger">
                  Suppr.
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
      {total > 0 && <Pagination page={page} perPage={perPage} total={total} basePath="/admin/rosee-matinale" />}
    </>
  );
}

