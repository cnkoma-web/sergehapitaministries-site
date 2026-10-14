"use client";

import { useEffect, useRef, useState } from "react";

export default function PodcastShareActions({ title, message, url }: { title: string; message: string; url: string }) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const sharedText = `${message}\n${url}`;
  const encodedText = encodeURIComponent(sharedText);
  const encodedUrl = encodeURIComponent(url);

  useEffect(() => {
    function closeOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setMenuOpen(false);
    }
    function closeEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, []);

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(sharedText);
      setFeedback("Lien copié !");
      setMenuOpen(false);
      setTimeout(() => setFeedback(null), 2000);
    } catch {
      setFeedback("Copie impossible");
      setTimeout(() => setFeedback(null), 2000);
    }
  }

  async function handleShare() {
    const useNativeShare =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1024px), (pointer: coarse)").matches &&
      typeof navigator !== "undefined" &&
      "share" in navigator;

    if (useNativeShare) {
      try {
        await navigator.share({ title, text: message, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    setMenuOpen((open) => !open);
  }

  return (
    <div className="podcast-share-actions" data-share-root ref={rootRef}>
      <button
        type="button"
        onClick={handleShare}
        aria-label="Partager cet épisode"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        title="Partager"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="18" cy="5" r="2.6" />
          <circle cx="6" cy="12" r="2.6" />
          <circle cx="18" cy="19" r="2.6" />
          <path d="M8.4 10.7 15.6 6.6M8.4 13.3l7.2 4.1" />
        </svg>
      </button>

      {menuOpen && (
        <div className="podcast-share-menu" role="menu" aria-label="Partager cet épisode">
          <a href={`https://wa.me/?text=${encodedText}`} target="_blank" rel="noopener noreferrer" role="menuitem">
            WhatsApp
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
          >
            Facebook
          </a>
          <a href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodedText}`} role="menuitem">
            E-mail
          </a>
          <button type="button" onClick={copyShare} role="menuitem">
            Copier le lien
          </button>
        </div>
      )}

      {feedback && (
        <span className="share-feedback" data-share-feedback aria-live="polite">
          {feedback}
        </span>
      )}
    </div>
  );
}
