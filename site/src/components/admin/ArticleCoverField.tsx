"use client";

import { useState } from "react";
import ImageUploader from "./ImageUploader";

export default function ArticleCoverField({ currentUrl }: { currentUrl: string | null }) {
  const [url, setUrl] = useState(currentUrl);
  return (
    <>
      <input type="hidden" name="cover_url" value={url ?? ""} />
      <ImageUploader bucket="article-covers" currentUrl={url} onUploaded={(publicUrl) => setUrl(publicUrl)} />
    </>
  );
}
