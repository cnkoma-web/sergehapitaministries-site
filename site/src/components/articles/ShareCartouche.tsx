"use client";

import { useState, type ReactElement } from "react";
import {
  buildShareMessage,
  buildPlainShareMessage,
  buildBookShareMessage,
  buildPlainBookShareMessage,
  SHARE_BLOCK_INVITE,
  type ShareCategory,
  type PublicationShareContent,
} from "@/lib/share";

// Icônes SVG réelles pour chaque plateforme (jamais d'emoji ni de lettre
// bricolée en guise d'icône, cahier §1.1).
//
// Recontrôle validation humaine (13/09, reprise Je Confesse) — invalide les
// deux commentaires ci-dessous (retour du 05/09) : les icônes en couleur de
// marque (vert WhatsApp, bleu Facebook…) et leur ordre "choisi avec Serge"
// étaient en réalité les pictogrammes de l'ANCIEN site, jamais comparés un
// par un à prototype-html/site.js § shareIcons — qui définit des glyphes
// monochromes (currentColor), stroke fin (1.8), avec seulement certains
// tracés en aplat (classe .filled) — voir .share-icon svg/.share-icon
// .filled ci-dessous, repris à l'identique. Ordre maquette (identique sur
// toutes les pages, JC/RM/Connaître Jésus…) : WhatsApp, Telegram, X,
// Facebook, LinkedIn, Email, SMS, Copier le lien — jamais SMS en dernier.
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
  articleDate,
  excerpt,
  shareContent,
  bookDescription,
  invite,
  platformOrder,
}: {
  title: string;
  url: string;
  category?: ShareCategory;
  // platformOrder (SECTION 07 fiche Livre, lot dédié 15/09) : optionnel,
  // undefined par défaut — reprend alors l'ordre déjà en place ci-dessous
  // (WhatsApp, Telegram, X, Facebook, LinkedIn, Email, SMS, Copier),
  // AUCUN changement pour Connaître Jésus/Je Confesse/publications/Rosée
  // Matinale, qui ne le passent pas. La maquette de LA FICHE LIVRE
  // spécifiquement porte un ordre différent (whatsapp, x, facebook,
  // telegram, linkedin, email, copy, sms — vérifié dans le HTML source de
  // cette page précise, distinct de l'ordre déjà validé sur les autres
  // pages) : passé uniquement depuis livres/[slug]/page.tsx.
  platformOrder?: ("whatsapp" | "telegram" | "x" | "facebook" | "linkedin" | "email" | "sms" | "copy")[];
  // Phrase d'invitation propre à un appel précis, sans passer par une
  // catégorie (retour de validation humaine, page Connaître Jésus, qui n'a
  // ni catégorie ni livre) — prioritaire sur SHARE_BLOCK_INVITE[category]
  // si les deux sont fournis. N'ajoute aucun comportement aux appels
  // existants (QDLB/VS/RM/Livres) qui ne la passent pas.
  invite?: string;
  // Date de publication (retour du 07/09) — "du jour" remplacé par la vraie
  // date dans le message de partage (buildShareMessage), jour + mois en
  // toutes lettres. Requis dès que `category` est fourni (QDLB/VS/RM), voir
  // les 4 appels de ce composant qui passent l'un et l'autre ensemble.
  articleDate?: string;
  // Chapeau déjà enregistré pour la publication (retour du 05/09, 4e
  // passage) — jamais un nouveau champ, repris tel quel par buildShareMessage
  // pour l'extrait affiché dans le message. Optionnel : certaines
  // publications n'en ont pas (repli déjà géré par l'appelant, voir
  // publications/[slug]/page.tsx).
  excerpt?: string;
  shareContent?: PublicationShareContent;
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
    formattedMessage = buildShareMessage({ category, title, content: shareContent ?? { intro: excerpt }, articleDate, url });
    plainMessage = buildPlainShareMessage({ category, title, content: shareContent ?? { intro: excerpt }, articleDate, url });
  } else if (bookDescription) {
    formattedMessage = buildBookShareMessage({ title, description: bookDescription, url });
    plainMessage = buildPlainBookShareMessage({ title, description: bookDescription, url });
  } else {
    formattedMessage = plainMessage = `${title} - ${url}`;
  }
  // Test WhatsApp mobile : le message éditorial court conserve l'URL
  // canonique en dernière position, conformément au parcours de lecture.
  const encodedWhatsappMessage = encodeURIComponent(formattedMessage);
  const encodedPlainMessage = encodeURIComponent(plainMessage);

  // Pictogrammes (retour validation humaine, 13/09) : glyphes exacts de
  // prototype-html/site.js § shareIcons, viewBox 24x24, monochromes (voir
  // .share-icon svg/.share-icon .filled dans globals.css) — plus aucune
  // couleur de marque en dur, plus aucun viewBox 32x32 hérité de l'ancien
  // site. Regroupées en `platforms` (SECTION 07 fiche Livre, lot dédié
  // 15/09) pour permettre un ordre différent par page (`platformOrder`)
  // sans dupliquer le balisage.
  const platforms: Record<string, ReactElement> = {
    whatsapp: (
      <a
        key="whatsapp"
        className="share-icon"
        href={`https://wa.me/?text=${encodedWhatsappMessage}`}
        target="_blank"
        rel="noopener"
        aria-label="WhatsApp"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            className="filled"
            d="M12 2a9.6 9.6 0 0 0-8.2 14.6L2.5 21.5l5-1.3A9.7 9.7 0 1 0 12 2Zm0 17.4c-1.5 0-2.9-.4-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A7.7 7.7 0 1 1 12 19.4Zm4.2-5.7c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-1.4-.7-2.4-1.3-3.3-2.9-.2-.3.2-.3.7-1.1.1-.2 0-.4 0-.5l-.7-1.7c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 5 4.2 1.8.8 2.5.8 3.4.7.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .2-1.1-.1-.1-.3-.2-.5-.3Z"
          />
        </svg>
      </a>
    ),
    telegram: (
      <a
        key="telegram"
        className="share-icon"
        href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener"
        aria-label="Telegram"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            className="filled"
            d="M21.5 3.3 18.3 20c-.2 1.2-.9 1.5-1.8.9l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L5.8 13.8 1 12.3c-1-.3-1.1-1 .2-1.5L20 3.5c.9-.3 1.7.2 1.5-.2Z"
          />
        </svg>
      </a>
    ),
    x: (
      <a
        key="x"
        className="share-icon"
        href={`https://twitter.com/intent/tweet?text=${encodedPlainMessage}`}
        target="_blank"
        rel="noopener"
        aria-label="X (Twitter)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            className="filled"
            d="M18.9 2H22l-6.8 7.8L23.2 22H17l-4.9-6.4L6.5 22H3.4l7.2-8.2L2.9 2h6.3l4.4 5.8L18.9 2Zm-1.1 17.9h1.7L8.3 4H6.5l11.3 15.9Z"
          />
        </svg>
      </a>
    ),
    facebook: (
      <a
        key="facebook"
        className="share-icon"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener"
        aria-label="Facebook"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            className="filled"
            d="M13.8 22v-9h3l.5-3.5h-3.5V7.3c0-1 .3-1.7 1.8-1.7h1.9V2.5c-.3 0-1.5-.1-2.8-.1-2.8 0-4.7 1.7-4.7 4.8v2.3H7V13h3v9h3.8Z"
          />
        </svg>
      </a>
    ),
    linkedin: (
      <a
        key="linkedin"
        className="share-icon"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener"
        aria-label="LinkedIn"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            className="filled"
            d="M5.3 7.8H2.1V22h3.2V7.8ZM3.7 2A1.9 1.9 0 1 0 3.7 5.8 1.9 1.9 0 0 0 3.7 2ZM22 13.8c0-4.3-2.3-6.3-5.4-6.3-2.5 0-3.6 1.4-4.2 2.3v-2H9.2V22h3.2v-7c0-1.8.4-3.6 2.7-3.6 2.3 0 2.3 2.1 2.3 3.7V22H22v-8.2Z"
          />
        </svg>
      </a>
    ),
    email: (
      <a key="email" className="share-icon" href={`mailto:?subject=${encodedTitle}&body=${encodedPlainMessage}`} aria-label="Email">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
          <path d="m3.5 6 8.5 7 8.5-7" />
        </svg>
      </a>
    ),
    // SMS repris à sa vraie place (retour validation humaine, 13/09) — la
    // maquette l'affiche comme un bouton normal parmi les 8, jamais en
    // dernier ni masqué sur desktop (voir .v2-jc-page .share-icon-sms dans
    // globals.css, qui annule ici seulement la règle @media(hover:hover) —
    // décision produit distincte du 05/09, non remise en cause ailleurs).
    sms: (
      <a key="sms" className="share-icon share-icon-sms" href={`sms:&body=${encodedPlainMessage}`} aria-label="SMS">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4.5h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10l-5.5 3v-3H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z" />
          <circle className="filled" cx="8" cy="11" r=".7" />
          <circle className="filled" cx="12" cy="11" r=".7" />
          <circle className="filled" cx="16" cy="11" r=".7" />
        </svg>
      </a>
    ),
    // Icône "copier" (retour du 05/09, 4e passage) — glyphe conservé (déjà
    // conforme au glyphe "copy" de la maquette), sans style inline
    // retirant le cadre/le fond (régression déjà corrigée précédemment).
    copy: (
      <button
        key="copy"
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
        aria-label="Copier le lien"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="8" y="8" width="12" height="12" rx="2" />
          <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
        </svg>
      </button>
    ),
  };
  const order = platformOrder ?? ["whatsapp", "telegram", "x", "facebook", "linkedin", "email", "sms", "copy"];

  return (
    <div className="share-block">
      {/* Jamais sur les fiches livres (retour du 05/09, 4e passage) — le
          partage y garde uniquement les icônes, sans phrase d'invitation. */}
      {(invite ?? (category && SHARE_BLOCK_INVITE[category])) && (
        <p className="share-invite">{invite ?? SHARE_BLOCK_INVITE[category!]}</p>
      )}
      <div className="share-row">
        {/* Pictogrammes (retour validation humaine, 13/09) : glyphes exacts
            de prototype-html/site.js § shareIcons, viewBox 24x24, monochromes
            (voir .share-icon svg/.share-icon .filled dans globals.css) —
            plus aucune couleur de marque en dur, plus aucun viewBox 32x32
            hérité de l'ancien site. Rendues via `platforms` + `order`
            (SECTION 07 fiche Livre, lot dédié 15/09) pour permettre un
            ordre différent par page (prop `platformOrder`) sans dupliquer
            le balisage — voir sa définition en tête de fichier. */}
        {order.map((key) => platforms[key])}
      </div>
      {copied && (
        <p className="copy-feedback" role="status">
          Lien copié !
        </p>
      )}
    </div>
  );
}
