import type { Article } from "./articles";

const dateFormats = {
  full: new Intl.DateTimeFormat("fr-FR", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }),
  long: new Intl.DateTimeFormat("fr-FR", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  }),
  short: new Intl.DateTimeFormat("fr-FR", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
  }),
};

// article_date is a calendar date. Keep that day in every rendering timezone.
export function formatArticleDate(
  article: Pick<Article, "article_date">,
  format: keyof typeof dateFormats = "full",
): string {
  return dateFormats[format].format(new Date(article.article_date));
}

export function articleHref(article: Pick<Article, "type" | "article_date" | "slug">): string {
  switch (article.type) {
    case "rm":
      return `/rosee-matinale/${article.article_date}`;
    case "jc":
      return `/publications/je-confesse-et-declare/${article.article_date}`;
    default:
      return `/publications/${article.slug}`;
  }
}
