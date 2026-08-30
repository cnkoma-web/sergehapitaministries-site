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
}: {
  src: string;
  hoverSrc?: string | null;
  alt: string;
  className?: string;
}) {
  if (!hoverSrc) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} style={{ width: "100%", height: "100%", objectFit: "contain" }} />;
  }
  return (
    <div className={`cover-rollover ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="cr-front" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={hoverSrc} alt="" aria-hidden="true" className="cr-back" />
    </div>
  );
}
