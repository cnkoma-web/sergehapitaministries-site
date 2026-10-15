import { createClient } from "@/lib/supabase/server";

export type PageContentField = {
  key: string;
  label: string;
  kind: "text" | "textarea";
  defaultValue: string;
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
