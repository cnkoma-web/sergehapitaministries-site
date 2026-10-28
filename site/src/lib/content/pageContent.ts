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
    slug: "accueil",
    label: "Accueil",
    publicPath: "/",
    description: "Textes éditoriaux de l’accueil, classés dans l’ordre exact des blocs visibles.",
    fields: [
      { key: "hero_eyebrow", label: "Sur-titre", kind: "text", section: "Bannière principale", defaultValue: "Porter le salut de Christ jusqu'aux extrémités de la terre" },
      { key: "hero_line_1", label: "Titre — ligne 1", kind: "text", section: "Bannière principale", defaultValue: "Révéler Christ." },
      { key: "hero_line_2", label: "Titre — ligne 2", kind: "text", section: "Bannière principale", defaultValue: "Affermir le chrétien." },
      { key: "hero_line_3", label: "Titre accentué — ligne 3", kind: "text", section: "Bannière principale", defaultValue: "Manifester le Royaume." },
      { key: "hero_summary", label: "Présentation", kind: "textarea", rows: 5, section: "Bannière principale", defaultValue: "Serge Hapita est un prophète de la révélation et de la conscience filiale. Son ministère porte une onction qui ravive la foi, restaure la communion avec Dieu le Père et la conscience de l'identité de fils. Quand il partage la Parole, c'est une rencontre avec l'Esprit : la vie se manifeste, l'esprit se réveille, la foi se met à l'œuvre." },
      { key: "hero_more", label: "Lien de présentation", kind: "text", section: "Bannière principale", defaultValue: "Lire davantage" },
      { key: "hero_jesus_action", label: "Bouton Connaître Jésus", kind: "text", section: "Bannière principale", defaultValue: "Je désire connaître Jésus" },
      { key: "hero_invite_action", label: "Bouton Invitation", kind: "text", section: "Bannière principale", defaultValue: "J'invite Serge" },

      { key: "jesus_eyebrow", label: "Sur-titre", kind: "text", section: "Connaître Jésus", defaultValue: "La porte vers la vie" },
      { key: "jesus_title", label: "Titre", kind: "text", section: "Connaître Jésus", defaultValue: "Connaître Jésus" },
      { key: "jesus_intro", label: "Introduction", kind: "textarea", rows: 3, section: "Connaître Jésus", defaultValue: "Découvrez pourquoi Jésus est venu, ce qu'il a accompli et la vie qu'il offre aujourd'hui à celui qui croit en lui." },
      { key: "jesus_micro", label: "Accroche", kind: "text", section: "Connaître Jésus", defaultValue: "Une histoire incroyable. Et pourtant…" },
      { key: "jesus_question", label: "Question", kind: "text", section: "Connaître Jésus", defaultValue: "Pourquoi Jésus est-il venu ?" },
      { key: "jesus_text", label: "Présentation", kind: "textarea", rows: 4, section: "Connaître Jésus", defaultValue: "Il y a presque deux mille ans, Jésus de Nazareth est venu porter le salut, révéler le Père et donner la vie éternelle à quiconque croit." },
      { key: "jesus_action", label: "Bouton", kind: "text", section: "Connaître Jésus", defaultValue: "Entrer dans cet univers" },
      { key: "jesus_topic_1", label: "Repère 1", kind: "text", section: "Connaître Jésus", defaultValue: "Sa naissance miraculeuse" },
      { key: "jesus_topic_2", label: "Repère 2", kind: "text", section: "Connaître Jésus", defaultValue: "Sa mission et ses œuvres" },
      { key: "jesus_topic_3", label: "Repère 3", kind: "text", section: "Connaître Jésus", defaultValue: "Sa mort et sa résurrection" },
      { key: "jesus_topic_4", label: "Repère 4", kind: "text", section: "Connaître Jésus", defaultValue: "Recevoir la vie en Jésus" },

      { key: "publications_eyebrow", label: "Sur-titre", kind: "text", section: "Univers de publication", defaultValue: "Quatre expressions de la Parole" },
      { key: "publications_title", label: "Titre", kind: "text", section: "Univers de publication", defaultValue: "Une Parole pour chaque besoin" },
      { key: "publications_action", label: "Lien général", kind: "text", section: "Univers de publication", defaultValue: "Toutes les publications →" },
      { key: "dew_title", label: "Rosée — titre", kind: "text", section: "Univers de publication", defaultValue: "Mieux penser, mieux choisir et mieux vivre." },
      { key: "dew_text", label: "Rosée — présentation", kind: "textarea", section: "Univers de publication", defaultValue: "Des pensées courtes et percutantes qui apportent sagesse, recul et inspiration pour la vie quotidienne." },
      { key: "dew_action", label: "Rosée — lien", kind: "text", section: "Univers de publication", defaultValue: "Lire la pensée du jour →" },
      { key: "bible_title", label: "Bible — titre", kind: "text", section: "Univers de publication", defaultValue: "Dieu a dit, alors nous disons aussi" },
      { key: "bible_text", label: "Bible — présentation", kind: "textarea", section: "Univers de publication", defaultValue: "Un examen quotidien des Écritures pour construire la véritable connaissance de Dieu dans la vie de ceux qui nous suivent." },
      { key: "bible_action", label: "Bible — lien", kind: "text", section: "Univers de publication", defaultValue: "Examiner les Écritures →" },
      { key: "confess_title", label: "Je Confesse — titre", kind: "text", section: "Univers de publication", defaultValue: "La Parole de Dieu dans votre bouche." },
      { key: "confess_text", label: "Je Confesse — présentation", kind: "textarea", section: "Univers de publication", defaultValue: "Des déclarations et des proclamations fondées sur la Parole de Dieu, à affirmer avec foi sur votre vie." },
      { key: "confess_action", label: "Je Confesse — lien", kind: "text", section: "Univers de publication", defaultValue: "Découvrir Je Confesse →" },
      { key: "life_title", label: "Vie Supérieure — titre", kind: "text", section: "Univers de publication", defaultValue: "Une connaissance destinée à devenir l'expérience de la vie en Christ." },
      { key: "life_text", label: "Vie Supérieure — présentation", kind: "textarea", section: "Univers de publication", defaultValue: "Des enseignements approfondis consacrés aux réalités de la nouvelle création et à leur manifestation dans la vie du chrétien." },
      { key: "life_action", label: "Vie Supérieure — lien", kind: "text", section: "Univers de publication", defaultValue: "Entrer dans l'enseignement →" },

      { key: "books_eyebrow", label: "Sur-titre", kind: "text", section: "Livres", defaultValue: "amDG Éditions" },
      { key: "books_title_prefix", label: "Titre — début", kind: "text", section: "Livres", defaultValue: "Dernières" },
      { key: "books_title_emphasis", label: "Titre — mot accentué", kind: "text", section: "Livres", defaultValue: "parutions" },
      { key: "books_action", label: "Lien catalogue", kind: "text", section: "Livres", defaultValue: "Voir tout le catalogue →" },
      { key: "events_eyebrow", label: "Sur-titre", kind: "text", section: "Agenda", defaultValue: "Agenda" },
      { key: "events_title", label: "Titre", kind: "text", section: "Agenda", defaultValue: "Rencontres et conférences" },
      { key: "events_intro", label: "Présentation", kind: "textarea", section: "Agenda", defaultValue: "Retrouvez les prochains rendez-vous du ministère et revivez les événements qui ont marqué La Vie Supérieure." },

      { key: "support_eyebrow", label: "Sur-titre", kind: "text", section: "Soutien", defaultValue: "Soutenir" },
      { key: "support_title", label: "Titre", kind: "text", section: "Soutien", defaultValue: "Associez-vous à cette œuvre du Royaume de Dieu" },
      { key: "support_text", label: "Présentation", kind: "textarea", rows: 4, section: "Soutien", defaultValue: "Depuis des générations, la Parole de Dieu apporte la guérison, le salut et la lumière dans la vie de milliers de personnes. Votre générosité permet à cette œuvre de poursuivre sa mission." },
      { key: "support_action", label: "Bouton", kind: "text", section: "Soutien", defaultValue: "Devenir semeur de la Parole" },
      { key: "community_eyebrow", label: "Sur-titre", kind: "text", section: "Communauté", defaultValue: "Rester connecté" },
      { key: "community_title", label: "Titre", kind: "textarea", rows: 2, section: "Communauté", defaultValue: "La Parole continue\nau fil de la semaine." },
    ],
  },
  {
    slug: "mission",
    label: "Mission",
    publicPath: "/mission",
    description: "Tous les textes éditoriaux de la page Mission, dans l’ordre exact de leur affichage.",
    fields: [
      { key: "hero_eyebrow", label: "Sur-titre", kind: "text", section: "En-tête", defaultValue: "La mission" },
      { key: "hero_line_1", label: "Titre — ligne 1", kind: "text", section: "En-tête", defaultValue: "Révéler Christ." },
      { key: "hero_line_2", label: "Titre — ligne 2", kind: "text", section: "En-tête", defaultValue: "Affermir le chrétien." },
      { key: "hero_line_3", label: "Titre accentué — ligne 3", kind: "text", section: "En-tête", defaultValue: "Manifester le Royaume." },
      { key: "mandate_label", label: "Libellé de section", kind: "text", section: "01 — Le mandat", defaultValue: "Le mandat" },
      { key: "mandate_body", label: "Contenu", kind: "richtext", section: "01 — Le mandat", compact: false, minHeight: 360, defaultValue: `<blockquote>« Ouvrir les yeux des hommes, les faire passer des ténèbres à la lumière et de la puissance de Satan à Dieu, afin qu'ils reçoivent, par la foi en Jésus-Christ, le pardon des péchés et l'héritage avec les sanctifiés. »<cite>Actes 26:15-18</cite></blockquote><p>Le ministère de Serge Hapita est né de ce mandat.</p><p>Si tu ne connais pas encore Christ, ce mandat s'adresse à toi en premier : la vie que Dieu te propose commence par cette rencontre, et rien de ce qui suit n'a de sens sans elle.</p><p>Ce mandat rejoint aussi celui qui croit déjà. Car il est possible d'avoir cru, de lire les Écritures et de confesser sa foi, tout en demeurant prisonnier de réalités dont la vérité est pourtant venue nous affranchir.</p>` },
      { key: "revelation_eyebrow", label: "Sur-titre", kind: "text", section: "02 — La révélation", defaultValue: "02 — La révélation" },
      { key: "revelation_title", label: "Titre", kind: "text", section: "02 — La révélation", defaultValue: "La vérité qui rend libre" },
      { key: "revelation_body", label: "Contenu", kind: "richtext", section: "02 — La révélation", compact: false, minHeight: 360, defaultValue: `<p>Jésus s'adressait à des Juifs qui avaient cru en Lui lorsqu'Il leur déclara : « Si vous demeurez dans ma parole, vous êtes vraiment mes disciples ; vous connaîtrez la vérité, et la vérité vous affranchira » (Jean 8:31-32).</p><p>Peut-être crois-tu sincèrement en Dieu, et pourtant tu restes enfermé dans la peur, la culpabilité, des traditions humaines, ou une image de toi-même que la nouvelle naissance a déjà rendue caduque. Tu possèdes dans les Écritures la vérité capable de te rendre libre — mais cette vérité doit encore être révélée à ton cœur. C'est précisément là qu'intervient ce ministère : non pas t'apporter une information de plus, mais ouvrir en toi ce que tu n'as pas encore vu.</p><p>C'est pourquoi Paul priait pour que les croyants reçoivent un esprit de sagesse et de révélation dans la connaissance de Dieu, et que les yeux de leur cœur soient éclairés (Éphésiens 1:17-18). Lorsque cette lumière se lève, tu reconnais ce que tu es devenu en Christ, ce que tu possèdes déjà en Lui, et la vie à laquelle Dieu t'a appelé.</p>` },
      { key: "identity_label", label: "Libellé de section", kind: "text", section: "03 — L’identité", defaultValue: "L'identité" },
      { key: "identity_title", label: "Titre", kind: "text", section: "03 — L’identité", defaultValue: "La conscience d'être fils" },
      { key: "identity_body", label: "Contenu", kind: "richtext", section: "03 — L’identité", compact: false, minHeight: 300, defaultValue: `<p>Découvrir Christ te conduit à connaître Dieu comme ton Père. Tu prends conscience de la position que la grâce t'a donnée, et tu apprends à vivre depuis cette réalité plutôt qu'à la chercher.</p><p>Cette conscience change ta manière de penser, de croire, de parler et d'agir. Elle t'établit dans la justice, renouvelle ton intelligence et fait naître en toi l'assurance nécessaire pour accomplir ce que Dieu a préparé d'avance pour toi.</p>` },
      { key: "identity_emphasis", label: "Texte mis en valeur", kind: "richtext", section: "03 — L’identité", minHeight: 160, defaultValue: `Le fils qui connaît le Père porte Son empreinte dans son monde. Jésus pouvait dire : « Celui qui m'a vu a vu le Père » (Jean 14:9). C'est cette même dynamique qui se poursuit à travers ceux que ce ministère accompagne.` },
      { key: "manifestation_eyebrow", label: "Sur-titre", kind: "text", section: "04 — La manifestation", defaultValue: "04 — La manifestation" },
      { key: "manifestation_title", label: "Titre", kind: "text", section: "04 — La manifestation", defaultValue: "Le Royaume rendu visible" },
      { key: "manifestation_body", label: "Contenu", kind: "richtext", section: "04 — La manifestation", compact: false, minHeight: 280, defaultValue: `<p>Le Royaume de Dieu se manifeste lorsque Son règne atteint concrètement la vie des hommes : les captifs sont libérés, les malades guéris, les opprimés délivrés, les vies brisées restaurées. Ce n'est pas une image — c'est ce que le Salut accompli en Jésus-Christ produit quand il cesse d'être une doctrine et devient une réalité expérimentée.</p><p>Par l'enseignement de la Parole, l'annonce de l'Évangile, la prière et l'exercice de l'autorité du Nom de Jésus, Serge Hapita Ministries œuvre pour que les hommes voient, comprennent et expérimentent ce que Dieu leur a déjà donné en Christ.</p>` },
      { key: "next_eyebrow", label: "Sur-titre", kind: "text", section: "Conclusion", defaultValue: "Et maintenant ?" },
      { key: "next_title", label: "Titre", kind: "text", section: "Conclusion", defaultValue: "Et maintenant ?" },
      { key: "next_first_intro", label: "Premier appel — introduction", kind: "text", section: "Conclusion", defaultValue: "Si tu ne connais pas encore Christ," },
      { key: "next_first_action", label: "Premier appel — lien", kind: "text", section: "Conclusion", defaultValue: "découvre qui Il est →" },
      { key: "next_second_intro", label: "Second appel — introduction", kind: "textarea", rows: 2, section: "Conclusion", defaultValue: "Si ce que tu viens de lire résonne avec quelque chose que tu portes déjà," },
      { key: "next_second_action", label: "Second appel — lien", kind: "text", section: "Conclusion", defaultValue: "contacte Serge →" },
    ],
  },
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
