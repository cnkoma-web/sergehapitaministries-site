"use client";

import { useState } from "react";
import ImageUploader from "./ImageUploader";

// Même principe exact qu'ArticleCoverField — bucket dédié podcast-covers
// (1:1, cover art d'épisode) au lieu d'article-covers (16:9).
export default function PodcastCoverField({ currentUrl }: { currentUrl: string | null }) {
  const [url, setUrl] = useState(currentUrl);
  return (
    <>
      <input type="hidden" name="cover_url" value={url ?? ""} />
      <ImageUploader bucket="podcast-covers" currentUrl={url} onUploaded={(publicUrl) => setUrl(publicUrl)} />
    </>
  );
}
