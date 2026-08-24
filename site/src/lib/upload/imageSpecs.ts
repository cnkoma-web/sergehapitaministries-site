// Spécifications d'image par bucket de stockage (cahier §1.4).
// Résolutions minimales proposées par Claude Code — présentées à Serge, pas
// arbitrairement définitives : à ajuster si besoin, un seul endroit à changer.

export type ImageBucket = "book-covers" | "product-photos";

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
};

// Tolérance sur le ratio pour absorber les arrondis d'export (ex. 801×1199) sans
// rejeter une image en réalité conforme.
const RATIO_TOLERANCE = 0.02;

export type ImageCheckResult =
  | { ok: true; width: number; height: number; warning?: string }
  | { ok: false; reason: string };

export function checkImageDimensions(
  spec: ImageSpec,
  width: number,
  height: number
): ImageCheckResult {
  const actualRatio = width / height;
  const deviation = Math.abs(actualRatio - spec.ratio) / spec.ratio;

  if (deviation > RATIO_TOLERANCE) {
    return {
      ok: false,
      reason: `Cette image est au format ${width}×${height} (ratio ${actualRatio.toFixed(2)}), mais un ${spec.label.toLowerCase()} doit être au format ${spec.ratioLabel}. Recadrez l'image avant de l'importer.`,
    };
  }

  if (width < spec.minWidth || height < spec.minHeight) {
    return {
      ok: true,
      width,
      height,
      warning: `Cette image (${width}×${height}) est plus petite que la résolution recommandée (${spec.minWidth}×${spec.minHeight}) — elle sera acceptée, mais risque de paraître floue en grand écran.`,
    };
  }

  return { ok: true, width, height };
}

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
