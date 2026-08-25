// Étoiles pleines/vides — reprend exactement .stars/.stars .empty de la maquette
// (livre_detail.html). `rating` peut être un nombre décimal (moyenne) : arrondi
// à l'entier le plus proche pour l'affichage plein/vide.
export default function Stars({ rating }: { rating: number | null }) {
  const filled = rating ? Math.round(rating) : 0;
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i > filled ? "empty" : undefined}>
          ★
        </span>
      ))}
    </div>
  );
}
