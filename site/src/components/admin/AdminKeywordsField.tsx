type Props = {
  defaultKeywords?: string[];
};

export default function AdminKeywordsField({ defaultKeywords = [] }: Props) {
  return (
    <>
      <input
        type="text"
        name="seo_keywords"
        defaultValue={defaultKeywords.join(", ")}
        placeholder="identité, victoire, confession"
        autoComplete="off"
        aria-describedby="seo-keywords-help"
      />
      <small id="seo-keywords-help">Séparez les mots-clés par des virgules.</small>
    </>
  );
}
