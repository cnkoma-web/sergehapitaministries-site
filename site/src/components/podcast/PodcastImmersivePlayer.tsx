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

    let cancelled = false;
    const tryAutoplay = () => {
      if (cancelled || !audio.paused) return;
      void audio.play()
        .then(() => setAutoplayBlocked(false))
        .catch(() => setAutoplayBlocked(true));
    };
    const retrySoon = window.setTimeout(tryAutoplay, 180);
    const retryAfterLoad = window.setTimeout(tryAutoplay, 700);
    const retryWhenVisible = () => {
      if (document.visibilityState === "visible") tryAutoplay();
    };

    tryAutoplay();
    audio.addEventListener("loadedmetadata", tryAutoplay);
    audio.addEventListener("canplay", tryAutoplay);
    window.addEventListener("pageshow", tryAutoplay);
    document.addEventListener("visibilitychange", retryWhenVisible);

    return () => {
      cancelled = true;
      window.clearTimeout(retrySoon);
      window.clearTimeout(retryAfterLoad);
      audio.removeEventListener("loadedmetadata", tryAutoplay);
      audio.removeEventListener("canplay", tryAutoplay);
      window.removeEventListener("pageshow", tryAutoplay);
      document.removeEventListener("visibilitychange", retryWhenVisible);
    };
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
        preload="auto"
        autoPlay={autoPlay}
        playsInline
        onPlay={() => {
          setPlaying(true);
          setAutoplayBlocked(false);
        }}
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
          <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M14 14V7l-7 7 7 7v-7a15 15 0 1 1-3.4 9.5" /></svg><small>10</small>
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
          <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M34 14V7l7 7-7 7v-7a15 15 0 1 0 3.4 9.5" /></svg><small>30</small>
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
