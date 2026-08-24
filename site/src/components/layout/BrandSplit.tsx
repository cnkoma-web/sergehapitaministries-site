import { getBrandSplitLinks } from "@/lib/content/nav";

// Bandeau double-marque : 2 blocs pleine largeur cliquables (ActesDesFilsDeDieu / amDG Éditions).
// Jamais "Serge Hapita" ici — déjà représenté par le logo dans le header (cahier §1.2).
export default async function BrandSplit() {
  const { left, right } = await getBrandSplitLinks();
  return (
    <div className="brand-split">
      <a href={left.href} target="_blank" rel="noopener noreferrer">
        {left.label}
      </a>
      <a href={right.href} target="_blank" rel="noopener noreferrer">
        {right.label}
      </a>
    </div>
  );
}
