import { createClient } from "@/lib/supabase/server";

export type LinkOption = { label: string; href: string };
export type LinkGroup = { groupLabel: string; options: LinkOption[] };

const STATIC_PAGES: LinkOption[] = [
  { label: "Accueil", href: "/" },
  { label: "De Serge", href: "/de-serge" },
  { label: "Livres (catalogue)", href: "/livres" },
  { label: "Boutique", href: "/boutique" },
  { label: "Publications (hub)", href: "/publications" },
  { label: "Rosée Matinale", href: "/rosee-matinale" },
  { label: "Vidéos", href: "/videos" },
  { label: "Invitation", href: "/invitation" },
  { label: "Partenariat / Faire un don", href: "/partenariat" },
  { label: "Connaître Jésus", href: "/connaitre-jesus" },
  { label: "Contact", href: "/contact" },
  { label: "Mon compte", href: "/compte" },
  { label: "Newsletter (ancre)", href: "/#newsletter" },
];

/** Toutes les destinations "cliquables" du site, groupées, pour les sélecteurs
 * de lien (ticker, menu de navigation...) — Serge choisit un livre/article par
 * son titre, jamais en tapant une adresse à la main. */
export async function getLinkableResources(): Promise<LinkGroup[]> {
  const supabase = await createClient();

  const [{ data: books }, { data: goodies }, { data: articles }] = await Promise.all([
    supabase.from("books").select("slug, title").neq("status", "hidden").order("position", { ascending: true }),
    supabase.from("goodies").select("slug, title").eq("active", true).order("position", { ascending: true }),
    supabase
      .from("articles")
      .select("slug, title, type")
      .eq("status", "published")
      .neq("type", "rm")
      .order("article_date", { ascending: false }),
  ]);

  return [
    { groupLabel: "Pages du site", options: STATIC_PAGES },
    { groupLabel: "Livres", options: (books ?? []).map((b) => ({ label: b.title, href: `/livres/${b.slug}` })) },
    { groupLabel: "Boutique", options: (goodies ?? []).map((g) => ({ label: g.title, href: `/boutique/${g.slug}` })) },
    { groupLabel: "Publications", options: (articles ?? []).map((a) => ({ label: a.title, href: `/publications/${a.slug}` })) },
  ];
}
