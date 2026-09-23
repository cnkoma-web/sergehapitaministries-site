"use client";

import { useState } from "react";

type Props = {
  defaultKeywords?: string[];
};

export default function AdminKeywordsField({ defaultKeywords = [] }: Props) {
  const [value, setValue] = useState(defaultKeywords.join(", "));

  return (
    <>
      <input type="hidden" name="seo_keywords" value={value} />
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="identité, victoire, confession"
        autoComplete="off"
        aria-describedby="seo-keywords-help"
      />
      <small id="seo-keywords-help">Séparez les mots-clés par des virgules.</small>
    </>
  );
}
