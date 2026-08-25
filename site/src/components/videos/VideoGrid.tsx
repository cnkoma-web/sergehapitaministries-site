"use client";

import { useState } from "react";
import { VIDEO_CATEGORY_LABEL, extractYoutubeId, type Video, type VideoCategory } from "@/lib/content/videoTypes";

const CATEGORIES: VideoCategory[] = ["predications", "enseignements", "temoignages"];
const GRADIENTS: Record<VideoCategory, string> = {
  predications: "linear-gradient(135deg,#7B3FE4,#1B1730)",
  enseignements: "linear-gradient(135deg,#2E2FE0,#1B1730)",
  temoignages: "linear-gradient(135deg,#3D6E86,#1B1730)",
};
// Complète visuellement chaque catégorie à 2 emplacements minimum tant qu'il n'y
// a pas assez de vraies vidéos — reprend le choix déjà validé de la maquette
// statique (§Partie 2 du cahier), sans stocker de fausses données en base.
const MIN_SLOTS_PER_CATEGORY = 2;

type Filter = "all" | VideoCategory;

export default function VideoGrid({ videos }: { videos: Video[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [openVideo, setOpenVideo] = useState<Video | null>(null);

  const slots: Array<{ video: Video | null; category: VideoCategory }> = [];
  for (const category of CATEGORIES) {
    const real = videos.filter((v) => v.category === category);
    real.forEach((v) => slots.push({ video: v, category }));
    for (let i = real.length; i < MIN_SLOTS_PER_CATEGORY; i++) {
      slots.push({ video: null, category });
    }
  }

  const visibleSlots = filter === "all" ? slots : slots.filter((s) => s.category === filter);

  return (
    <>
      <div className="vid-filters">
        <button className={filter === "all" ? "vid-filter active" : "vid-filter"} onClick={() => setFilter("all")}>
          Toutes
        </button>
        {CATEGORIES.map((c) => (
          <button key={c} className={filter === c ? "vid-filter active" : "vid-filter"} onClick={() => setFilter(c)}>
            {VIDEO_CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      <div className="vid-grid">
        {visibleSlots.map((slot, i) =>
          slot.video ? (
            <div className="vid-card" key={slot.video.id} onClick={() => slot.video!.youtube_url && setOpenVideo(slot.video)}>
              <div className="vid-thumb" style={{ background: GRADIENTS[slot.category] }}>
                <span className="vid-cat-tag">{VIDEO_CATEGORY_LABEL[slot.category]}</span>
                <div className="play">▶</div>
              </div>
              <div className="vid-body">
                <h3>{slot.video.title}</h3>
                {slot.video.description && <p>{slot.video.description}</p>}
              </div>
            </div>
          ) : (
            <div className="vid-card" key={`placeholder-${slot.category}-${i}`} style={{ cursor: "default" }}>
              <div className="vid-thumb" style={{ background: GRADIENTS[slot.category] }}>
                <span className="vid-cat-tag">{VIDEO_CATEGORY_LABEL[slot.category]}</span>
                <div className="play">▶</div>
              </div>
              <div className="vid-body">
                <h3>Titre à venir</h3>
                <p>Description à venir</p>
              </div>
            </div>
          )
        )}
      </div>

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
