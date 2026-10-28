"use client";

import { useRef, useState } from "react";

export default function PodcastInlinePlayButton({ src, title }: { src: string; title: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) await audio.play();
    else audio.pause();
  };

  return (
    <button
      type="button"
      className="v2-jc-audio-icon"
      onClick={togglePlayback}
      aria-label={playing ? `Mettre ${title} en pause` : `Écouter ${title}`}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <span aria-hidden="true">{playing ? "❚❚" : "▶"}</span>
    </button>
  );
}
