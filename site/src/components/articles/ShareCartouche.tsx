"use client";

import { useState } from "react";
import {
  buildShareMessage,
  buildPlainShareMessage,
  buildBookShareMessage,
  buildPlainBookShareMessage,
  SHARE_BLOCK_INVITE,
  type ShareCategory,
} from "@/lib/share";

// Icônes SVG réelles pour chaque plateforme (jamais d'emoji ni de lettre
// bricolée en guise d'icône, cahier §1.1).
//
// Retour du 05/09, 2e passage — icônes "nues" (glyphe de marque en couleur,
// sans le cercle plein qui les encapsulait auparavant). Retour du 05/09,
// 4e passage : la phrase d'invitation ("Bénis quelqu'un...") et les icônes
// vivent désormais dans un même bloc encadré par deux traits fins — voir
// .share-block plus bas, plus léger que l'ancienne disposition.
//
// Ordre choisi avec Serge : WhatsApp, X, Facebook, Telegram, LinkedIn, Email,
// Copier le lien, SMS (SMS toujours en dernier — n'a de sens que sur mobile).
//
// Deux groupes de boutons :
// - Message personnalisé (WhatsApp, Telegram, X, SMS) : voir
//   buildShareMessage/buildPlainShareMessage dans src/lib/share.ts, dès que
//   category est fourni (les publications) — ou buildBookShareMessage/
//   buildPlainBookShareMessage quand bookDescription est fourni à la place
//   (fiche livre). Sans aucun des deux (ex. page "Connaître Jésus", qui n'a
//   ni catégorie ni livre), on retombe sur l'ancien comportement
//   "titre - lien" simple. WhatsApp/Telegram acceptent la mise en forme
//   *gras*/_italique_, X/SMS ne l'interprètent pas — deux messages
//   distincts, mêmes mots.
// - Lien seul (Facebook, LinkedIn) : limitation propre à ces plateformes,
//   leurs boutons de partage ignorent tout texte personnalisé par
//   conception, pas un choix technique de ce composant.
export default function ShareCartouche({
  title,
  url,
  category,
  excerpt,
  bookDescription,
}: {
  title: string;
  url: string;
  category?: ShareCategory;
  // Chapeau déjà enregistré pour la publication (retour du 05/09, 4e
  // passage) — jamais un nouveau champ, repris tel quel par buildShareMessage
  // pour l'extrait affiché dans le message. Optionnel : certaines
  // publications n'en ont pas (repli déjà géré par l'appelant, voir
  // publications/[slug]/page.tsx).
  excerpt?: string;
  // Description du livre, débarrassée de son HTML par l'appelant (voir
  // livres/[slug]/page.tsx) — jamais utilisé en même temps que category.
  bookDescription?: string;
}) {
  const [copied, setCopied] = useState(false);

  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  let formattedMessage: string;
  let plainMessage: string;
  if (category) {
    formattedMessage = buildShareMessage({ category, title, excerpt, url });
    plainMessage = buildPlainShareMessage({ category, title, excerpt, url });
  } else if (bookDescription) {
    formattedMessage = buildBookShareMessage({ title, description: bookDescription, url });
    plainMessage = buildPlainBookShareMessage({ title, description: bookDescription, url });
  } else {
    formattedMessage = plainMessage = `${title} - ${url}`;
  }
  const encodedFormattedMessage = encodeURIComponent(formattedMessage);
  const encodedPlainMessage = encodeURIComponent(plainMessage);

  return (
    <div className="share-block">
      {/* Jamais sur les fiches livres (retour du 05/09, 4e passage) — le
          partage y garde uniquement les icônes, sans phrase d'invitation. */}
      {category && <p className="share-invite">{SHARE_BLOCK_INVITE[category]}</p>}
      <div className="share-row">
        <a
          className="share-icon"
          href={`https://api.whatsapp.com/send?text=${encodedFormattedMessage}`}
          target="_blank"
          rel="noopener"
          title="Partager sur WhatsApp"
          aria-label="WhatsApp"
        >
          <svg viewBox="0 0 32 32">
            <path
              fill="#25D366"
              d="M23.5 8.5a10.6 10.6 0 0 0-16.9 12.7L5 26l5-1.5A10.6 10.6 0 0 0 23.5 8.5Zm-7.4 16.3a8.8 8.8 0 0 1-4.5-1.2l-.3-.2-3.3 1 1-3.2-.2-.3a8.8 8.8 0 1 1 7.3 3.9Zm4.8-6.6c-.3-.1-1.6-.8-1.8-.9-.2-.1-.4-.1-.6.1s-.7.9-.9 1.1-.4.2-.6.1a7.2 7.2 0 0 1-2.1-1.3 8 8 0 0 1-1.5-1.8c-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5s0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.6 1.1 2.8s1.7 2.7 4.3 3.7a5 5 0 0 0 3 .2c.5-.1 1.6-.6 1.8-1.3s.2-1.2.2-1.3-.2-.2-.4-.3Z"
            />
          </svg>
        </a>
        <a
          className="share-icon"
          href={`https://twitter.com/intent/tweet?text=${encodedPlainMessage}`}
          target="_blank"
          rel="noopener"
          title="Partager sur X"
          aria-label="X (Twitter)"
        >
          <svg viewBox="0 0 32 32">
            <path fill="#000" d="M17.7 14.9 23.4 8h-1.7l-4.9 6-4-6h-5l6.1 8.9-6.2 7.1h1.7l5.3-6.4 4.3 6.4h5l-6.3-9.1Zm-1.9 2.2-.6-.9L10.3 9h2.3l4 5.8.6.9 5.2 7.5h-2.3l-4.3-6.1Z" />
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
            <path fill="#1877F2" d="M18 11.5h2.2V8.3h-2.7c-3 0-4.2 1.7-4.2 4.2v2H11v3.2h2.3V27h3.4v-9.3h2.6l.4-3.2h-3V12c0-.3.1-.5.3-.5Z" />
          </svg>
        </a>
        <a
          className="share-icon"
          href={`https://t.me/share/url?text=${encodedFormattedMessage}`}
          target="_blank"
          rel="noopener"
          title="Partager sur Telegram"
          aria-label="Telegram"
        >
          <svg viewBox="0 0 32 32">
            <path fill="#26A5E4" d="M22.9 9.8 20.4 22.4c-.2 1-.8 1.2-1.5.8l-4.3-3.2-2 2c-.2.2-.4.4-.9.4l.3-4.5 8.1-7.4c.4-.3-.1-.5-.5-.2L9 15.6l-4.4-1.4c-1-.3-1-1 .2-1.4L21.6 8.4c.8-.3 1.6.2 1.3 1.4Z" />
          </svg>
        </a>
        <a
          className="share-icon"
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noopener"
          title="Partager sur LinkedIn"
          aria-label="LinkedIn"
        >
          <svg viewBox="0 0 32 32">
            <path
              fill="#0A66C2"
              d="M11.75 13.5H8.5V23h3.25v-9.5Zm-1.62-1.45a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8ZM23.5 23h-3.25v-4.9c0-1.17-.02-2.68-1.63-2.68-1.63 0-1.88 1.28-1.88 2.6V23H13.5v-9.5h3.12v1.3h.04c.43-.82 1.5-1.68 3.08-1.68 3.3 0 3.9 2.17 3.9 5v4.88Z"
            />
          </svg>
        </a>
        <a className="share-icon" href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`} title="Partager par email" aria-label="Email">
          <svg viewBox="0 0 32 32">
            <path fill="var(--ink-soft)" d="M8 11h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Zm.6 1.4L16 17l7.4-4.6H8.6ZM7.6 21H24.4V13.6L16 18.9l-8.4-5.3V21Z" />
          </svg>
        </a>
        {/* Icône "copier" reconnaissable (retour du 05/09, 4e passage) —
            l'ancienne icône façon petite chaîne n'était pas assez explicite.
            Feedback "Lien copié !" affiché sous la rangée (voir plus bas),
            pas en bulle au-dessus de l'icône : sur mobile, la rangée défile
            horizontalement (overflow-x:auto, voir plus haut) et rogne
            verticalement tout ce qui dépasserait au-dessus d'elle — constaté
            en vérifiant, une bulle y restait invisible. */}
        <button
          className="share-icon"
          onClick={() => {
            // "Lien copié !" seulement si la copie a vraiment réussi (retour
            // du 05/09, 4e passage) — un navigateur qui refuse l'accès au
            // presse-papiers ne doit pas afficher un faux succès.
            navigator.clipboard
              .writeText(url)
              .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              })
              .catch(() => {});
          }}
          title="Copier le lien"
          aria-label="Copier le lien"
          style={{ border: 0, background: "none", cursor: "pointer", padding: 0 }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--ink-soft)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
        {/* SMS toujours en dernier (retour du 05/09) — n'a de sens que sur un
            appareil qui peut effectivement en envoyer un, masqué sur desktop
            en CSS (hover:hover et pointer:fine, même principe que le survol
            des cartes ailleurs sur le site) plutôt qu'en JS : pas de décalage
            d'hydratation entre le rendu serveur et le premier rendu client. */}
        <a className="share-icon share-icon-sms" href={`sms:&body=${encodedPlainMessage}`} title="Partager par SMS" aria-label="SMS">
          <svg viewBox="0 0 32 32">
            <path
              fill="var(--purple)"
              d="M16 8c-4.4 0-8 3.1-8 7 0 2.2 1.2 4.2 3 5.5v3l3-1.7c.6.1 1.3.2 2 .2 4.4 0 8-3.1 8-7s-3.6-7-8-7Z"
            />
          </svg>
        </a>
      </div>
      {copied && (
        <p className="copy-feedback" role="status">
          Lien copié !
        </p>
      )}
    </div>
  );
}
