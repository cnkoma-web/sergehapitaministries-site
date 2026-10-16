const SITE_URL = "https://sergehapitaministries.org";

type JsonLdValue = Record<string, unknown> | Record<string, unknown>[];

function safeJsonLd(value: JsonLdValue): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function JsonLd({ data }: { data: JsonLdValue }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}

export function SiteIdentityJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${SITE_URL}/#organization`,
            name: "Serge Hapita Ministries",
            url: SITE_URL,
            logo: {
              "@type": "ImageObject",
              url: `${SITE_URL}/logo.png`,
            },
            founder: { "@id": `${SITE_URL}/de-serge#person` },
          },
          {
            "@type": "Person",
            "@id": `${SITE_URL}/de-serge#person`,
            name: "Serge Hapita",
            url: `${SITE_URL}/de-serge`,
            image: `${SITE_URL}/assets/portrait-serge.jpg`,
            worksFor: { "@id": `${SITE_URL}/#organization` },
          },
        ],
      }}
    />
  );
}

type Breadcrumb = {
  name: string;
  url: string;
};

export function EditorialArticleJsonLd({
  title,
  description,
  url,
  publishedAt,
  modifiedAt,
  section,
  image,
  keywords,
  breadcrumbs,
}: {
  title: string;
  description?: string | null;
  url: string;
  publishedAt: string;
  modifiedAt?: string | null;
  section: string;
  image?: string | null;
  keywords?: string[];
  breadcrumbs: Breadcrumb[];
}) {
  const absoluteImage = image
    ? image.startsWith("http")
      ? image
      : `${SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`
    : undefined;

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Article",
            "@id": `${url}#article`,
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            headline: title,
            description: description || undefined,
            datePublished: publishedAt,
            dateModified: modifiedAt || publishedAt,
            inLanguage: "fr-FR",
            articleSection: section,
            keywords: keywords && keywords.length > 0 ? keywords.join(", ") : undefined,
            image: absoluteImage ? [absoluteImage] : undefined,
            author: { "@id": `${SITE_URL}/de-serge#person` },
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
          {
            "@type": "BreadcrumbList",
            "@id": `${url}#breadcrumb`,
            itemListElement: breadcrumbs.map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: item.name,
              item: item.url,
            })),
          },
        ],
      }}
    />
  );
}
