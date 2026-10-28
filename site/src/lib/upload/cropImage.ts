// Recadrage automatique côté client. La sortie est limitée à 1920 px de
// large afin d'éviter les échecs mémoire des canvas mobiles sur les PNG lourds.
export async function cropImageToRatio(file: File, targetRatio: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const w = bitmap.width;
    const h = bitmap.height;
    if (!w || !h) throw new Error("Les dimensions de cette image sont illisibles.");

    const currentRatio = w / h;
    let sx = 0;
    let sy = 0;
    let sw = w;
    let sh = h;

    if (currentRatio > targetRatio) {
      sw = Math.round(h * targetRatio);
      sx = Math.round((w - sw) / 2);
    } else if (currentRatio < targetRatio) {
      sh = Math.round(w / targetRatio);
      sy = Math.round((h - sh) / 2);
    }

    const outputWidth = Math.max(1, Math.min(sw, 1920));
    const outputHeight = Math.max(1, Math.round(outputWidth / targetRatio));
    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Le recadrage d’image n’est pas disponible sur cet appareil.");

    ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, outputWidth, outputHeight);
    const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error("La conversion de l’image a échoué.")),
        outputType,
        0.9
      );
    });
  } finally {
    bitmap.close();
  }
}
