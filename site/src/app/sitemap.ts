import type { MetadataRoute } from "next";
import { getBooks } from "@/lib/content/books";
import { getGoodies } from "@/lib/content/goodies";
import { getPublishedArticles } from "@/lib/content/articles";

const SITE_URL = "https://sergehapitaministries.org";

const STATIC_ROUTES = [
  "",
  "/de-serge",
  "/livres",
  "/videos",
  "/invitation",
  "/partenariat",
  "/connaitre-jesus",
  "/publications",
  "/rosee-matinale",
  "/boutique",
  "/contact",
  "/compte",
  "/mentions-legales",
  "/politique-de-confidentialite",
  "/politique-de-cookies",
  "/termes-et-conditions",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [books, goodies, qdlb, vs, rm] = await Promise.all([
    getBooks(),
    getGoodies(),
    getPublishedArticles("qdlb"),
    getPublishedArticles("vs"),
    getPublishedArticles("rm"),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));

  const bookEntries: MetadataRoute.Sitemap = books.map((b) => ({
    url: `${SITE_URL}/livres/${b.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const goodieEntries: MetadataRoute.Sitemap = goodies.map((g) => ({
    url: `${SITE_URL}/boutique/${g.slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  // "La Vie Supérieure" gardé public dans le plan de site malgré le mur de
  // connexion (contenu réel accessible gratuitement après création de compte,
  // pas payant — cahier §3.5), donc légitime à indexer comme les deux autres.
  const articleEntries: MetadataRoute.Sitemap = [...qdlb, ...vs].map((a) => ({
    url: `${SITE_URL}/publications/${a.slug}`,
    lastModified: a.article_date,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  // Corrigé au passage (retour du 05/09, restructuration Rosée Matinale en
  // URL par jour) — ces entrées pointaient jusqu'ici vers /publications/...,
  // une URL qui n'a jamais existé pour cette catégorie (404 silencieux pour
  // les moteurs de recherche) : Rosée Matinale a sa propre page dédiée
  // (/rosee-matinale/[date]), jamais /publications/[slug].
  const roseeEntries: MetadataRoute.Sitemap = rm.map((a) => ({
    url: `${SITE_URL}/rosee-matinale/${a.article_date}`,
    lastModified: a.article_date,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticEntries, ...bookEntries, ...goodieEntries, ...articleEntries, ...roseeEntries];
}
