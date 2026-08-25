import { createClient } from "@/lib/supabase/server";
import { addArticle, updateArticle, deleteArticle } from "./actions";

type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  article_date: string;
  excerpt: string | null;
  verse_reference: string | null;
  verse_text: string | null;
  body: string | null;
  further_verses: { reference: string; text: string }[];
  toc_keywords: string[];
  access: string;
  status: string;
  reading_time_minutes: number | null;
};

function ArticleForm({ a, type }: { a?: ArticleRow; type: "qdlb" | "vs" }) {
  const action = a ? updateArticle : addArticle;
  return (
    <form action={action} className="admin-card" style={{ marginBottom: 16 }}>
      {a && <input type="hidden" name="id" value={a.id} />}
      <input type="hidden" name="type" value={type} />

      <div className="admin-form-row">
        <div className="admin-field" style={{ flex: 2 }}>
          <label>Titre</label>
          <input name="title" defaultValue={a?.title} required />
        </div>
        <div className="admin-field" style={{ maxWidth: 160 }}>
          <label>Date</label>
          <input name="article_date" type="date" defaultValue={a?.article_date} />
        </div>
        <div className="admin-field" style={{ flex: 1 }}>
          <label>Statut</label>
          <select name="status" defaultValue={a?.status ?? "draft"}>
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
          </select>
        </div>
      </div>

      <div className="admin-field" style={{ marginBottom: 14 }}>
        <label>Chapeau (résumé court, jamais le verset — cahier §3.4)</label>
        <input name="excerpt" defaultValue={a?.excerpt ?? ""} />
      </div>

      {type === "qdlb" && (
        <>
          <div className="admin-form-row">
            <div className="admin-field" style={{ flex: 1 }}>
              <label>Référence du verset</label>
              <input name="verse_reference" defaultValue={a?.verse_reference ?? ""} placeholder="ex. 2 Corinthiens 4:18" />
            </div>
          </div>
          <div className="admin-field" style={{ marginBottom: 14 }}>
            <label>Texte du verset</label>
            <textarea name="verse_text" defaultValue={a?.verse_text ?? ""} rows={2} />
          </div>
          <div className="admin-field" style={{ marginBottom: 14 }}>
            <label>Versets complémentaires — un par ligne, format « Référence | Texte »</label>
            <textarea
              name="further_verses"
              rows={3}
              defaultValue={(a?.further_verses ?? []).map((v) => `${v.reference} | ${v.text}`).join("\n")}
              placeholder="Éphésiens 1:18-19 | Je prie qu'il illumine..."
            />
          </div>
        </>
      )}

      {type === "vs" && (
        <>
          <div className="admin-form-row">
            <div className="admin-field" style={{ flex: 1 }}>
              <label>Accès</label>
              <select name="access" defaultValue={a?.access ?? "free"}>
                <option value="free">Gratuit (compte requis)</option>
                <option value="paid">Payant (à activer plus tard)</option>
              </select>
            </div>
          </div>
          <div className="admin-field" style={{ marginBottom: 14 }}>
            <label>Aperçu du sommaire verrouillé — un mot-clé/titre de section par ligne</label>
            <textarea name="toc_keywords" rows={4} defaultValue={(a?.toc_keywords ?? []).join("\n")} />
          </div>
        </>
      )}

      <div className="admin-field" style={{ marginBottom: 14 }}>
        <label>
          Corps de l&apos;article — un paragraphe par ligne vide{" "}
          {a?.reading_time_minutes ? `(≈ ${a.reading_time_minutes} min de lecture)` : ""}
        </label>
        <textarea name="body" defaultValue={a?.body ?? ""} rows={8} />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" className="admin-btn-sm">{a ? "Enregistrer" : "Créer"}</button>
        {a && (
          <button type="submit" formAction={deleteArticle} className="admin-btn-sm danger">
            Supprimer
          </button>
        )}
      </div>
    </form>
  );
}

export default async function AdminPublicationsPage() {
  const supabase = await createClient();
  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, slug, title, article_date, excerpt, verse_reference, verse_text, body, further_verses, toc_keywords, access, status, reading_time_minutes, type")
    .in("type", ["qdlb", "vs"])
    .order("article_date", { ascending: false });

  const qdlb = articles?.filter((a) => a.type === "qdlb") ?? [];
  const vs = articles?.filter((a) => a.type === "vs") ?? [];

  return (
    <>
      <h1>Publications</h1>
      <p className="admin-lede">Articles « Que Dit la Bible ? » et « La Vie Supérieure ».</p>

      {error && <div className="admin-error">Impossible de charger les articles : {error.message}</div>}

      <h3 style={{ marginBottom: 12 }}>Que Dit la Bible ?</h3>
      {qdlb.map((a) => (
        <ArticleForm key={a.id} a={a} type="qdlb" />
      ))}
      <ArticleForm type="qdlb" />

      <h3 style={{ margin: "32px 0 12px" }}>La Vie Supérieure</h3>
      {vs.map((a) => (
        <ArticleForm key={a.id} a={a} type="vs" />
      ))}
      <ArticleForm type="vs" />
    </>
  );
}
