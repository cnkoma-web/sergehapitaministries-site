"use client";

import { useEffect, useRef, useState } from "react";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
}

export default function PodcastImmersivePlayer({
  src,
  title,
  coverUrl,
  autoPlay = false,
}: {
  src: string;
  title: string;
  coverUrl: string | null;
  autoPlay?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !autoPlay) return;
    void audio.play().catch(() => {
      // Les navigateurs mobiles bloquent souvent l’autoplay sonore.
      // L’écran d’écoute reste ouvert avec une invitation explicite à lancer l’audio.
      setAutoplayBlocked(true);
    });
  }, [autoPlay]);

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      await audio.play();
      setAutoplayBlocked(false);
    }
    else audio.pause();
  }

  function seekBy(delta: number) {
    const audio = audioRef.current;
    if (!audio) return;
    const next = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + delta));
    audio.currentTime = next;
    setCurrentTime(next);
  }

  return (
    <div className={`v2-immersive-player${autoplayBlocked ? " is-awaiting-play" : ""}`}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
      />

      <div className="v2-immersive-artwork">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL publique issue du CMS.
          <img src={coverUrl} alt={`Pochette de ${title}`} />
        ) : (
          <span aria-hidden="true">♪</span>
        )}
      </div>

      {autoplayBlocked && <p className="v2-immersive-play-prompt">Appuie sur Lecture pour écouter</p>}

      <div className="v2-immersive-main-controls">
        <button type="button" className="v2-immersive-skip" onClick={() => seekBy(-10)} aria-label="Reculer de 10 secondes">
          <span aria-hidden="true">↶</span><small>10</small>
        </button>
        <button
          type="button"
          className="v2-immersive-toggle"
          onClick={togglePlayback}
          aria-label={playing ? "Mettre en pause" : "Lancer la lecture"}
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <button type="button" className="v2-immersive-skip" onClick={() => seekBy(30)} aria-label="Avancer de 30 secondes">
          <span aria-hidden="true">↷</span><small>30</small>
        </button>
      </div>

      <input
        className="v2-immersive-progress"
        type="range"
        min={0}
        max={duration || 0}
        step={1}
        value={Math.min(currentTime, duration || 0)}
        aria-label="Position de lecture"
        onChange={(event) => {
          const next = Number(event.currentTarget.value);
          if (audioRef.current) audioRef.current.currentTime = next;
          setCurrentTime(next);
        }}
      />
      <div className="v2-immersive-times" aria-hidden="true">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
