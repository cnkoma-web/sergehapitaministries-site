// Spécifications d'image par bucket de stockage (cahier §1.4).
// Résolutions minimales proposées par Claude Code — présentées à Serge, pas
// arbitrairement définitives : à ajuster si besoin, un seul endroit à changer.

export type ImageBucket = "book-covers" | "product-photos" | "article-covers";

export type ImageSpec = {
  bucket: ImageBucket;
  label: string;
  ratio: number; // largeur / hauteur
  ratioLabel: string;
  minWidth: number;
  minHeight: number;
  maxFileSizeMb: number;
};

export const IMAGE_SPECS: Record<ImageBucket, ImageSpec> = {
  "book-covers": {
    bucket: "book-covers",
    label: "Couverture de livre",
    ratio: 2 / 3,
    ratioLabel: "2:3 (portrait)",
    minWidth: 800,
    minHeight: 1200,
    maxFileSizeMb: 5,
  },
  "product-photos": {
    bucket: "product-photos",
    label: "Photo produit",
    ratio: 1,
    ratioLabel: "1:1 (carré)",
    minWidth: 1000,
    minHeight: 1000,
    maxFileSizeMb: 5,
  },
  "article-covers": {
    bucket: "article-covers",
    label: "Couverture d'article",
    ratio: 16 / 9,
    ratioLabel: "16:9 (paysage)",
    minWidth: 1200,
    minHeight: 675,
    maxFileSizeMb: 5,
  },
};

export function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Impossible de lire ce fichier comme une image."));
    };
    img.src = objectUrl;
  });
}
