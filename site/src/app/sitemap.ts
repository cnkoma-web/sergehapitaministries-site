import type { MetadataRoute } from "next";
import { getBooks } from "@/lib/content/books";
import { getGoodies } from "@/lib/content/goodies";
import { getPublishedArticles } from "@/lib/content/articles";
import { getPublishedPodcastEpisodesForSitemap } from "@/lib/content/podcast";

const SITE_URL = "https://sergehapitaministries.org";

const STATIC_ROUTES = [
  "",
  "/de-serge",
  "/mission",
  "/livres",
  "/videos",
  "/podcast",
  "/invitation",
  "/partenariat",
  "/connaitre-jesus",
  "/publications",
  "/publications/que-dit-la-bible",
  "/publications/la-vie-superieure",
  "/publications/je-confesse-et-declare",
  "/rosee-matinale",
  "/boutique",
  "/contact",
  "/mentions-legales",
  "/politique-de-confidentialite",
  "/politique-de-cookies",
  "/termes-et-conditions",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [books, goodies, qdlb, vs, rm, jc, podcasts] = await Promise.all([
    getBooks(),
    getGoodies(),
    getPublishedArticles("qdlb"),
    getPublishedArticles("vs"),
    getPublishedArticles("rm"),
    getPublishedArticles("jc"),
    getPublishedPodcastEpisodesForSitemap(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency:
      path === "" || path === "/publications" || path === "/podcast"
        ? "weekly"
        : path.startsWith("/publications/") || path === "/rosee-matinale"
          ? "daily"
          : "monthly",
    priority:
      path === ""
        ? 1
        : path === "/publications" || path.startsWith("/publications/") || path === "/rosee-matinale"
          ? 0.8
          : 0.6,
  }));

  const bookEntries: MetadataRoute.Sitemap = books.map((book) => ({
    url: `${SITE_URL}/livres/${book.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const goodieEntries: MetadataRoute.Sitemap = goodies.map((goodie) => ({
    url: `${SITE_URL}/boutique/${goodie.slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const articleEntries: MetadataRoute.Sitemap = [...qdlb, ...vs].map((article) => ({
    url: `${SITE_URL}/publications/${article.slug}`,
    lastModified: article.updated_at,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const roseeEntries: MetadataRoute.Sitemap = rm.map((article) => ({
    url: `${SITE_URL}/rosee-matinale/${article.article_date}`,
    lastModified: article.updated_at,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const confessionEntries: MetadataRoute.Sitemap = jc.map((article) => ({
    url: `${SITE_URL}/publications/je-confesse-et-declare/${article.article_date}`,
    lastModified: article.updated_at,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const podcastEntries: MetadataRoute.Sitemap = podcasts.map((episode) => ({
    url: `${SITE_URL}/podcast/${episode.slug}`,
    lastModified: episode.updated_at || episode.episode_date,
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  return [
    ...staticEntries,
    ...bookEntries,
    ...goodieEntries,
    ...articleEntries,
    ...roseeEntries,
    ...confessionEntries,
    ...podcastEntries,
  ];
}
