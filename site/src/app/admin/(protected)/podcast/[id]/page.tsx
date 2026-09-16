import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPodcastEpisodeByIdAdmin } from "@/lib/content/podcast";
import { updatePodcastEpisode, publishPodcastEpisode, unpublishPodcastEpisode, deletePodcastEpisode } from "../actions";
import { ARTICLE_TYPE_LABEL, getArticleByIdAdmin, getArticleOptionsForPodcastLink } from "@/lib/content/articles";
import PodcastCoverField from "@/components/admin/PodcastCoverField";
import SavedToast from "@/components/admin/SavedToast";

// V2 Lot 9 (11/09) — écran d'édition d'un épisode, calqué fichier pour
// fichier sur admin/publications/[id]/page.tsx (même principe des boutons
// formAction sur un seul formulaire englobant, plus un petit formulaire à
// part pour la suppression). Le champ « Lien audio » reste une simple URL
// texte (pas d'upload de fichier audio) — c'est le lien direct fourni par
// Ausha une fois l'épisode publié là-bas, en attendant une vraie
// synchronisation RSS/API (voir la migration 20260911030000).
export default async function AdminPodcastEpisodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const episode = await getPodcastEpisodeByIdAdmin(id);
  if (!episode) notFound();

  const wasPublished = episode.status === "published";
  const articleOptions = await getArticleOptionsForPodcastLink();
  // Garde-fou (chantier Podcast, reprise) : si l'article déjà lié n'est
  // plus publié (retiré/dépublié depuis), il n'apparaît pas dans la liste
  // ci-dessus — sans ce repli, le <select> retomberait silencieusement sur
  // "Aucun contenu associé" au premier enregistrement et effacerait à tort
  // une relation réelle jamais touchée par l'admin. Ajouté en tête de
  // liste dans ce seul cas, jamais autrement.
  const linkedArticleMissing = episode.linked_article_id && !articleOptions.some((a) => a.id === episode.linked_article_id);
  const currentlyLinkedArticle = linkedArticleMissing ? await getArticleByIdAdmin(episode.linked_article_id!) : null;

  return (
    <>
      <Suspense fallback={null}>
        <SavedToast />
      </Suspense>
      <form action={updatePodcastEpisode}>
        <div className="admin-editor-topbar" style={{ margin: "-32px -40px 32px" }}>
          <div className="left">
            <Link href="/admin/podcast">← Retour à la liste</Link>
            <strong style={{ color: "var(--ink)" }}>{episode.title}</strong>
            <span className={`status-badge ${wasPublished ? "actif" : "masque"}`}>
              {wasPublished ? "Publié" : "Brouillon"}
            </span>
          </div>
          <div className="actions">
            <button type="submit" form="delete-episode-form" className="btn-danger">
              Supprimer
            </button>
            {wasPublished && (
              <button type="submit" formAction={unpublishPodcastEpisode} className="admin-btn-ghost">
                Repasser en brouillon
              </button>
            )}
            <button type="submit" className="admin-btn-ghost">
              Enregistrer
            </button>
            <button type="submit" formAction={publishPodcastEpisode} className="admin-btn-primary">
              {wasPublished ? "Mettre à jour" : "Publier"}
            </button>
          </div>
        </div>

        <input type="hidden" name="id" value={episode.id} />
        <input type="hidden" name="was_published" value={wasPublished ? "1" : "0"} />

        <div className="editor-card" style={{ maxWidth: 720, margin: "0 auto" }}>
          <div className="editor-field">
            <label>Titre</label>
            <input type="text" name="title" defaultValue={episode.title} required />
          </div>

          <div className="editor-field-row" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 18 }}>
            <div className="editor-field" style={{ marginBottom: 0 }}>
              <label>Univers</label>
              <select name="universe" defaultValue={episode.universe}>
                {Object.entries(ARTICLE_TYPE_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="editor-field" style={{ marginBottom: 0 }}>
              <label>Date</label>
              <input type="date" name="episode_date" defaultValue={episode.episode_date} required />
            </div>
          </div>

          <div className="editor-field">
            <label>Thème (facultatif)</label>
            <input type="text" name="theme" defaultValue={episode.theme ?? ""} placeholder="Sous-titre / mot-clé de l'épisode" />
          </div>

          <div className="editor-field">
            <label>Lien audio (fourni par Ausha)</label>
            <input type="url" name="audio_url" defaultValue={episode.audio_url} placeholder="https://…" required />
          </div>

          <div className="editor-field-row" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 18 }}>
            <div className="editor-field" style={{ marginBottom: 0 }}>
              <label>Durée (secondes)</label>
              <input type="number" name="duration_seconds" defaultValue={episode.duration_seconds ?? ""} min={0} />
            </div>
            <div className="editor-field" style={{ marginBottom: 0 }}>
              <label>Ordre d&apos;affichage</label>
              <input type="number" name="position" defaultValue={episode.position} />
            </div>
          </div>

          <div className="editor-field">
            <label>Vignette (carrée)</label>
            <PodcastCoverField currentUrl={episode.cover_url} />
          </div>

          {/* CORRECTION CIBLÉE (chantier Podcast, reprise) : saisie libre
              d'UUID remplacée par un sélecteur alimenté par les vrais
              articles publiés (id/titre/type déjà en base — aucune
              migration nécessaire, la relation linked_article_id ->
              articles.id existe déjà). "Univers — Titre" affiché, jamais
              l'UUID ; "Aucun contenu associé" en première option ->
              enregistré comme chaîne vide, déjà traduit en null par
              saveEpisode() (actions.ts, inchangé). */}
          <div className="editor-field" style={{ marginBottom: 0 }}>
            <label>Contenu écrit associé (facultatif)</label>
            <select name="linked_article_id" defaultValue={episode.linked_article_id ?? ""}>
              <option value="">Aucun contenu associé</option>
              {currentlyLinkedArticle && (
                <option value={currentlyLinkedArticle.id}>
                  {ARTICLE_TYPE_LABEL[currentlyLinkedArticle.type]} — {currentlyLinkedArticle.title} (non publié)
                </option>
              )}
              {articleOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {ARTICLE_TYPE_LABEL[a.type]} — {a.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>

      <form id="delete-episode-form" action={deletePodcastEpisode}>
        <input type="hidden" name="id" value={episode.id} />
      </form>
    </>
  );
}
