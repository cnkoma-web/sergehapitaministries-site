"use client";

import { useRef, useState } from "react";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
}

export default function PodcastCardPlayer({ src, title }: { src: string; title: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) await audio.play();
    else audio.pause();
  };

  return (
    <div className="v2-podcast-player-preview">
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
      <button
        type="button"
        className="v2-podcast-play"
        onClick={togglePlayback}
        aria-label={playing ? `Mettre ${title} en pause` : `Écouter ${title}`}
      >
        {playing ? "❚❚" : "▶"}
      </button>
      <input
        className="v2-podcast-progress"
        type="range"
        min={0}
        max={duration || 0}
        step={1}
        value={Math.min(currentTime, duration || 0)}
        aria-label={`Position de lecture de ${title}`}
        onChange={(event) => {
          const nextTime = Number(event.currentTarget.value);
          if (audioRef.current) audioRef.current.currentTime = nextTime;
          setCurrentTime(nextTime);
        }}
      />
      <time>{formatTime(currentTime)} / {formatTime(duration)}</time>
    </div>
  );
}
