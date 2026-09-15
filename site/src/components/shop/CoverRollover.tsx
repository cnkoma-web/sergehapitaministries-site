// Effet de survol (rollover) sur une couverture/visuel produit : au survol,
// l'image principale (position 1) transitionne vers une seconde image
// (position 2 — ex. dos de couverture), comme sur rochedy.com (cahier §6.4).
// Pur CSS (deux images superposées, opacité croisée au :hover du conteneur)
// — fonctionne partout où une vignette est affichée, sans JS ni hydratation.
// Si aucune seconde image n'existe, affiche seulement la couverture : on ne
// simule jamais un visuel qui n'a pas été fourni.
export default function CoverRollover({
  src,
  hoverSrc,
  alt,
  className,
  // focusable (inspection + correction fiche Livre, 14/09) : optionnel,
  // false par défaut — AUCUN changement pour les usages existants (Hub
  // Livres/accueil), où CoverRollover est déjà nichée dans un <Link>
  // focusable ; y ajouter un tabindex créerait un 2e arrêt clavier
  // imbriqué et redondant, une régression réelle. Sur la fiche Livre, la
  // grande couverture n'est PAS dans un lien (on est déjà sur la page du
  // livre) : sans tabindex elle serait totalement inatteignable au
  // clavier, contrairement à la maquette (.cover-switch, tabindex="0",
  // uniquement sur cette page précise). Passé explicitement à true
  // seulement depuis livres/[slug]/page.tsx.
  focusable = false,
  // hoverAlt (inspection + correction SECTION 03 fiche Livre, 15/09) :
  // optionnel, undefined par défaut — AUCUN changement pour les usages
  // existants (Hub Livres/accueil/fiche Goodie), qui ne le passent pas et
  // conservent alt="" aria-hidden sur le dos (décoratif). La maquette de la
  // fiche Livre (.cover-back, alt="Quatrième de couverture de {titre}")
  // donne au contraire un texte alternatif réel au dos — passé
  // explicitement depuis livres/[slug]/page.tsx uniquement.
  hoverAlt,
}: {
  src: string;
  hoverSrc?: string | null;
  alt: string;
  className?: string;
  focusable?: boolean;
  hoverAlt?: string;
}) {
  if (!hoverSrc) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} style={{ width: "100%", height: "100%", objectFit: "contain" }} />;
  }
  return (
    <div className={`cover-rollover ${className ?? ""}`} tabIndex={focusable ? 0 : undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="cr-front" />
      {hoverAlt ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={hoverSrc} alt={hoverAlt} className="cr-back" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={hoverSrc} alt="" aria-hidden="true" className="cr-back" />
      )}
    </div>
  );
}
