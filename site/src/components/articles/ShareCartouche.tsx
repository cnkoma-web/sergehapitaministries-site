"use client";

import { useState } from "react";

// Icônes SVG réelles (WhatsApp vert, Facebook bleu officiel, enveloppe email,
// maillons de chaîne pour copier) — jamais d'emoji ni de lettre bricolée en
// guise d'icône (cahier §1.1).
export default function ShareCartouche({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  return (
    <div className="share-cartouche">
      <span className="share-label">Partager :</span>
      <a
        className="share-icon"
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20-%20${encodedUrl}`}
        target="_blank"
        rel="noopener"
        title="Partager sur WhatsApp"
        aria-label="WhatsApp"
      >
        <svg viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="16" fill="#25D366" />
          <path
            fill="#fff"
            d="M23.5 8.5a10.6 10.6 0 0 0-16.9 12.7L5 26l5-1.5A10.6 10.6 0 0 0 23.5 8.5Zm-7.4 16.3a8.8 8.8 0 0 1-4.5-1.2l-.3-.2-3.3 1 1-3.2-.2-.3a8.8 8.8 0 1 1 7.3 3.9Zm4.8-6.6c-.3-.1-1.6-.8-1.8-.9-.2-.1-.4-.1-.6.1s-.7.9-.9 1.1-.4.2-.6.1a7.2 7.2 0 0 1-2.1-1.3 8 8 0 0 1-1.5-1.8c-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5s0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.6 1.1 2.8s1.7 2.7 4.3 3.7a5 5 0 0 0 3 .2c.5-.1 1.6-.6 1.8-1.3s.2-1.2.2-1.3-.2-.2-.4-.3Z"
          />
        </svg>
      </a>
      <a
        className="share-icon"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener"
        title="Partager sur Facebook"
        aria-label="Facebook"
      >
        <svg viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="16" fill="#1877F2" />
          <path fill="#fff" d="M18 11.5h2.2V8.3h-2.7c-3 0-4.2 1.7-4.2 4.2v2H11v3.2h2.3V27h3.4v-9.3h2.6l.4-3.2h-3V12c0-.3.1-.5.3-.5Z" />
        </svg>
      </a>
      <a className="share-icon" href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`} title="Partager par email" aria-label="Email">
        <svg viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="16" fill="var(--ink-soft)" />
          <path fill="#fff" d="M8 11h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Zm.6 1.4L16 17l7.4-4.6H8.6ZM7.6 21H24.4V13.6L16 18.9l-8.4-5.3V21Z" />
        </svg>
      </a>
      <button
        className="share-icon"
        onClick={() => {
          navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        title="Copier le lien"
        aria-label="Copier le lien"
        style={{ border: 0, background: "none", cursor: "pointer", padding: 0, opacity: copied ? 0.5 : 1 }}
      >
        <svg viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="16" fill="var(--ink-soft)" />
          <path
            fill="#fff"
            d="M14.6 20.4a3.2 3.2 0 0 1 0-4.5l2.6-2.6a3.2 3.2 0 0 1 4.5 4.5l-1.3 1.3-1-1 1.3-1.3a1.7 1.7 0 1 0-2.4-2.4l-2.6 2.6a1.7 1.7 0 0 0 0 2.4Zm2.8-8.8a3.2 3.2 0 0 1 0 4.5l-2.6 2.6a3.2 3.2 0 0 1-4.5-4.5l1.3-1.3 1 1-1.3 1.3a1.7 1.7 0 1 0 2.4 2.4l2.6-2.6a1.7 1.7 0 0 0 0-2.4Z"
          />
        </svg>
      </button>
    </div>
  );
}
