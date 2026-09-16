"use client";

import { useState } from "react";
import { VIDEO_CATEGORY_LABEL, extractYoutubeId, type Video, type VideoCategory } from "@/lib/content/videoTypes";

const CATEGORIES: VideoCategory[] = ["predications", "enseignements", "temoignages"];

type Filter = "all" | VideoCategory;

// RECONSTRUCTION (chantier Vidéos, mise en conformité) : source de vérité
// maquettes-complementaires-shm/videos.html § .thumb — UN SEUL dégradé pour
// toutes les vignettes (jamais une couleur par catégorie) et un simple
// glyphe ▶ centré, sans cercle. La distinction de catégorie reste portée
// par l'étiquette texte (déjà réelle), pas par la couleur.
//
// Remplissage par cartes fictives RETIRÉ : la table videos est actuellement
// VIDE en production — remplir chaque catégorie à 2 emplacements minimum
// avec des cartes "Titre à venir" afficherait alors des données fabriquées
// comme SEUL contenu réel de la page. Filtres et modale YouTube (fonctions
// réelles dépassant la maquette statique, qui ne montre qu'une grille figée
// à 3 cartes) sont préservés, seule l'interface change.
export default function VideoGrid({ videos }: { videos: Video[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [openVideo, setOpenVideo] = useState<Video | null>(null);

  const visibleVideos = filter === "all" ? videos : videos.filter((v) => v.category === filter);

  return (
    <>
      {videos.length > 0 && (
        <div className="v2-video-filters">
          <button type="button" className={filter === "all" ? "active" : undefined} onClick={() => setFilter("all")}>
            Toutes
          </button>
          {CATEGORIES.map((c) => (
            <button key={c} type="button" className={filter === c ? "active" : undefined} onClick={() => setFilter(c)}>
              {VIDEO_CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
      )}

      {visibleVideos.length === 0 ? (
        <p className="empty-state">
          {videos.length === 0 ? "Aucune vidéo pour le moment. Revenez bientôt." : "Aucune vidéo dans cette catégorie pour le moment."}
        </p>
      ) : (
        <div className="v2-video-grid">
          {visibleVideos.map((video) => (
            <article className="v2-video-card" key={video.id} onClick={() => video.youtube_url && setOpenVideo(video)}>
              <div className="v2-video-thumb">
                <span aria-hidden="true">▶</span>
              </div>
              <div className="v2-video-body">
                <div className="v2-eyebrow">{VIDEO_CATEGORY_LABEL[video.category]}</div>
                <h3>{video.title}</h3>
                {video.description && <p>{video.description}</p>}
              </div>
            </article>
          ))}
        </div>
      )}

      {openVideo?.youtube_url && (
        <div className="vid-modal open" onClick={() => setOpenVideo(null)}>
          <div className="vid-modal-inner" onClick={(e) => e.stopPropagation()}>
            <button className="vid-modal-close" onClick={() => setOpenVideo(null)} aria-label="Fermer">
              ×
            </button>
            {extractYoutubeId(openVideo.youtube_url) ? (
              <iframe
                width="100%"
                height="100%"
                style={{ borderRadius: 10 }}
                src={`https://www.youtube.com/embed/${extractYoutubeId(openVideo.youtube_url)}`}
                title={openVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <p style={{ color: "#fff", padding: 20 }}>Lien vidéo invalide.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
