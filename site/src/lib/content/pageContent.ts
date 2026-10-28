import { createClient } from "@/lib/supabase/server";

export type PageContentField = {
  key: string;
  label: string;
  kind: "text" | "textarea" | "richtext";
  defaultValue: string;
  section?: string;
  help?: string;
  placeholder?: string;
  rows?: number;
  minHeight?: number;
  compact?: boolean;
};

export type PageContentDefinition = {
  slug: string;
  label: string;
  publicPath: string;
  description: string;
  fields: PageContentField[];
};

export const PAGE_CONTENT_DEFINITIONS: PageContentDefinition[] = [
  {
    slug: "contact",
    label: "Contact",
    publicPath: "/contact",
    description: "En-tête et introduction de la page de contact.",
    fields: [
      { key: "eyebrow", label: "Sur-titre", kind: "text", defaultValue: "Écrivez-nous" },
      { key: "title", label: "Titre", kind: "text", defaultValue: "Contact" },
      { key: "section_title", label: "Titre de l’introduction", kind: "text", defaultValue: "Parlons-en." },
      { key: "intro", label: "Texte d’introduction", kind: "textarea", defaultValue: "Une question, un témoignage ou un message ? Écrivez directement à Serge Hapita Ministries." },
    ],
  },
  {
    slug: "invitation",
    label: "Invitation",
    publicPath: "/invitation",
    description: "En-tête et introduction de la page d’invitation.",
    fields: [
      { key: "eyebrow", label: "Sur-titre", kind: "text", defaultValue: "À propos" },
      { key: "title", label: "Titre", kind: "text", defaultValue: "Invitation" },
      { key: "section_title", label: "Titre de l’introduction", kind: "text", defaultValue: "Vous souhaitez inviter Serge ?" },
      { key: "intro", label: "Texte d’introduction", kind: "textarea", defaultValue: "Envoyez-nous toutes les informations sur votre projet." },
    ],
  },
  {
    slug: "partenariat",
    label: "Partenariat",
    publicPath: "/partenariat",
    description: "Tous les textes éditoriaux de la page Partenariat.",
    fields: [
      { key: "eyebrow", label: "Sur-titre", kind: "text", defaultValue: "Partenariat" },
      { key: "title", label: "Titre principal", kind: "textarea", defaultValue: "Associez-vous à cette œuvre du Royaume de Dieu" },
      { key: "subtitle", label: "Introduction", kind: "textarea", defaultValue: "Des semences de foi plantées dans un terrain éternel — semer avec Dieu pour une moisson d’âmes et de bénédictions." },
      { key: "opening", label: "Présentation", kind: "textarea", defaultValue: "Cher ami, depuis des générations, la Parole de Dieu a apporté la guérison, le salut et la lumière dans la vie de milliers de personnes. À travers ce ministère, des vies sont continuellement touchées par la puissance de la Parole de Dieu et la présence de Jésus." },
      { key: "pivot", label: "Phrase de transition", kind: "textarea", defaultValue: "Et ce n’est possible que grâce à votre générosité qui nous aide à propager la Parole de Dieu." },
      { key: "donation_eyebrow", label: "Sur-titre du don", kind: "text", defaultValue: "Soutenir l’œuvre" },
      { key: "donation_title", label: "Titre du don", kind: "textarea", defaultValue: "Devenez un semeur de la Parole par votre don" },
      { key: "donation_intro", label: "Présentation du don", kind: "textarea", defaultValue: "Merci beaucoup d’avoir envisagé de devenir partenaire en soutenant ce ministère. Nous ne prenons pas votre générosité à la légère. Votre soutien financier est le fondement de cet important travail ministériel." },
    ],
  },
  {
    slug: "que-dit-la-bible",
    label: "Que dit la Bible ?",
    publicPath: "/publications/que-dit-la-bible",
    description: "Présentation de l’univers Que dit la Bible ?",
    fields: [
      { key: "title", label: "Titre", kind: "text", defaultValue: "Que dit la Bible ?" },
      { key: "intro", label: "Introduction", kind: "textarea", defaultValue: "Un examen quotidien des Écritures, dont le contenu et la puissance permettent de construire la véritable image de Dieu dans la vie de ceux qui nous suivent." },
      { key: "empty_state", label: "Message si aucun article", kind: "text", defaultValue: "Les premiers articles arrivent bientôt." },
    ],
  },
  {
    slug: "la-vie-superieure",
    label: "La Vie Supérieure",
    publicPath: "/publications/la-vie-superieure",
    description: "Présentation de l’univers La Vie Supérieure.",
    fields: [
      { key: "title", label: "Titre", kind: "text", defaultValue: "Les réalités de la vie en Christ" },
      { key: "intro", label: "Introduction", kind: "textarea", defaultValue: "Des enseignements approfondis consacrés à la nouvelle création, la vie de Dieu, la justice, l'identité en Christ, la connaissance spirituelle, la sagesse et l'œuvre du Saint-Esprit." },
      { key: "motto", label: "Phrase d’accroche", kind: "textarea", defaultValue: "Une connaissance destinée à devenir l'expérience de la vie en Christ." },
      { key: "empty_state", label: "Message si aucun enseignement", kind: "text", defaultValue: "Les premiers enseignements arrivent bientôt." },
    ],
  },
  {
    slug: "rosee-matinale",
    label: "Rosée Matinale",
    publicPath: "/rosee-matinale",
    description: "Présentation de la page Rosée Matinale.",
    fields: [
      { key: "title", label: "Titre", kind: "text", defaultValue: "Rosée Matinale" },
      { key: "intro", label: "Introduction", kind: "text", defaultValue: "Une nouvelle pensée chaque jour." },
      { key: "empty_state", label: "Message si aucune entrée", kind: "text", defaultValue: "La première entrée arrive bientôt." },
    ],
  },
  {
    slug: "je-confesse",
    label: "Je Confesse",
    publicPath: "/publications/je-confesse-et-declare",
    description: "Présentation de la page Je Confesse.",
    fields: [
      { key: "title", label: "Titre", kind: "text", defaultValue: "Je Confesse" },
      { key: "intro", label: "Introduction", kind: "text", defaultValue: "Une proclamation chaque jour." },
      { key: "empty_state", label: "Message si aucune proclamation", kind: "text", defaultValue: "La première proclamation arrive bientôt." },
    ],
  },
  {
    slug: "livres",
    label: "Livres",
    publicPath: "/livres",
    description: "Présentation du catalogue de livres.",
    fields: [
      { key: "eyebrow", label: "Sur-titre", kind: "text", defaultValue: "amDG Éditions du Royaume" },
      { key: "title", label: "Titre", kind: "text", defaultValue: "Livres" },
      { key: "intro", label: "Introduction", kind: "textarea", defaultValue: "Les ouvrages de Serge publiés sous amDG Éditions." },
      { key: "catalog_intro", label: "Présentation du catalogue", kind: "textarea", defaultValue: "Chaque livre est un compagnon de route, un outil de transformation, un appel à vivre selon la justice du Royaume." },
      { key: "empty_state", label: "Message si aucun livre", kind: "text", defaultValue: "Le catalogue est en cours de préparation." },
    ],
  },
  {
    slug: "podcast",
    label: "Podcast",
    publicPath: "/podcast",
    description: "Présentation et introduction de la bibliothèque Podcast.",
    fields: [
      { key: "title", label: "Titre", kind: "text", defaultValue: "Podcast" },
      { key: "intro", label: "Introduction", kind: "textarea", defaultValue: "Je Confesse, Que dit la Bible ?, Rosée Matinale et La Vie Supérieure à écouter." },
      { key: "library_title", label: "Titre de la bibliothèque", kind: "text", defaultValue: "La bibliothèque audio" },
      { key: "library_intro", label: "Introduction de la bibliothèque", kind: "textarea", defaultValue: "Choisis un univers, retrouve un thème et lance l’écoute." },
      { key: "empty_state", label: "Message si aucun épisode", kind: "text", defaultValue: "Les premiers épisodes arrivent bientôt." },
    ],
  },
  {
    slug: "publications",
    label: "Publications",
    publicPath: "/publications",
    description: "Titre, introduction et libellés de la page Publications.",
    fields: [
      { key: "title", label: "Titre", kind: "text", defaultValue: "Publications" },
      { key: "intro", label: "Introduction", kind: "textarea", defaultValue: "Des formats différents pour éclairer la pensée, approfondir la connaissance et donner une voix à la Parole." },
      { key: "qdlb_kicker", label: "Accroche Que dit la Bible ?", kind: "text", defaultValue: "Examiner" },
      { key: "vs_kicker", label: "Accroche La Vie Supérieure", kind: "text", defaultValue: "Approfondir" },
      { key: "rm_kicker", label: "Accroche Rosée Matinale", kind: "text", defaultValue: "Commencer le jour" },
      { key: "jc_kicker", label: "Accroche Je Confesse", kind: "text", defaultValue: "Proclamer" },
      { key: "empty_state", label: "Message si aucune publication", kind: "textarea", defaultValue: "Les premières publications arrivent bientôt." },
    ],
  },
];

export function getPageDefinition(slug: string) {
  return PAGE_CONTENT_DEFINITIONS.find((page) => page.slug === slug);
}

export async function getPageContent(slug: string): Promise<Record<string, string>> {
  const definition = getPageDefinition(slug);
  if (!definition) return {};

  const defaults = Object.fromEntries(definition.fields.map((field) => [field.key, field.defaultValue]));
  const keys = definition.fields.map((field) => `page.${slug}.${field.key}`);
  const supabase = await createClient();
  const { data, error } = await supabase.from("interface_texts").select("key, value").in("key", keys);
  if (error || !data) return defaults;

  for (const row of data) {
    const shortKey = row.key.slice(`page.${slug}.`.length);
    defaults[shortKey] = row.value;
  }
  return defaults;
}
