// Recadrage automatique côté client (cahier Partie 5 §6.4) : Serge ne doit
// jamais avoir à recadrer une image lui-même avant de l'envoyer, ni voir de
// blocage/avertissement de ratio à l'envoi. On recadre silencieusement au
// centre pour obtenir le ratio attendu, quelle que soit l'image fournie.
export function cropImageToRatio(file: File, targetRatio: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      const currentRatio = w / h;

      let sx = 0,
        sy = 0,
        sw = w,
        sh = h;
      if (currentRatio > targetRatio) {
        // Image trop large pour le ratio cible : on rogne les côtés.
        sw = Math.round(h * targetRatio);
        sx = Math.round((w - sw) / 2);
      } else if (currentRatio < targetRatio) {
        // Image trop haute : on rogne le haut/bas.
        sh = Math.round(w / targetRatio);
        sy = Math.round((h - sh) / 2);
      }

      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Recadrage impossible (canvas non supporté)."));
        return;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (!blob) {
            reject(new Error("Échec de la conversion de l'image recadrée."));
            return;
          }
          resolve(blob);
        },
        file.type === "image/png" ? "image/png" : "image/jpeg",
        0.92
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Impossible de lire ce fichier comme une image."));
    };
    img.src = objectUrl;
  });
}
