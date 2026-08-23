// Bandeau ticker défilant (topbar-track).
//
// ⚠️ TEMPORAIRE (Phase 1) : liste codée en dur, reprise telle quelle des maquettes statiques.
// Le cahier des charges exige explicitement (tête de document) que chaque phrase soit
// ajoutable/modifiable/supprimable depuis l'administration, sans limite de nombre fixée
// dans le code. En Phase 2, cette fonction sera remplacée par une lecture de la table
// `ticker_messages` (texte + lien optionnel + ordre + actif/inactif) — la liste ci-dessous
// n'est donc pas plafonnée à 3 par design, seulement par le contenu actuel des maquettes.

export type TickerMessage = { text: string; href?: string };

export function getTickerMessages(): TickerMessage[] {
  return [
    { text: "✝ Dernier livre — Ton Corps T'Écoute, disponible maintenant", href: "/livres#ton-corps" },
    // Lien vers /#newsletter (ancre sur l'accueil) plutôt que #newsletter : corrige un lien
    // mort repéré à l'audit (le bloc newsletter est absent de 9 pages sur 23, l'ancre locale
    // n'y existe donc pas — voir cahier-des-charges §1.2 « Bloc newsletter »).
    { text: "Recevez « ParoleDeViePourVous » chaque semaine — S'inscrire", href: "/#newsletter" },
    { text: "Un ministère depuis Levallois-Perret, France" },
  ];
}
