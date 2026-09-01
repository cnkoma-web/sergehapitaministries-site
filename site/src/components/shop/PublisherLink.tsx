// Le nom d'éditeur ("amDG Éditions") devient un lien externe vers
// amdgeditions.fr partout où il apparaît sur les pages livres (retour du
// 03/09) — uniquement quand le texte contient effectivement "amDG" : ce
// champ reste un texte libre saisi par l'admin, on ne force pas un lien
// vers une maison d'édition qui ne serait pas la bonne.
export default function PublisherLink({ publisher }: { publisher: string | null }) {
  if (!publisher) return null;
  if (!publisher.includes("amDG")) return <>{publisher}</>;
  return (
    <a href="https://www.amdgeditions.fr" target="_blank" rel="noopener noreferrer">
      {publisher}
    </a>
  );
}
