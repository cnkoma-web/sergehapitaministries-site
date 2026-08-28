"use client";

import { useState } from "react";
import ImageUploader from "./ImageUploader";

export default function GoodieImageField({ currentUrl }: { currentUrl: string | null }) {
  const [url, setUrl] = useState(currentUrl);
  return (
    <>
      <input type="hidden" name="image_url" value={url ?? ""} />
      <ImageUploader bucket="product-photos" currentUrl={url} onUploaded={(publicUrl) => setUrl(publicUrl)} />
    </>
  );
}
