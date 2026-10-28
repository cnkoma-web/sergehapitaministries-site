import { ARTICLE_TYPE_LABEL, type ArticleType } from "@/lib/content/articles";

type PodcastShareContent = {
  universe: ArticleType;
  title: string;
  episodeDate: string;
  theme?: string | null;
  verseReference?: string | null;
};

export function formatPodcastDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function buildPodcastShareMessage({
  universe,
  title,
  episodeDate,
  theme,
  verseReference,
}: PodcastShareContent): string {
  const label = ARTICLE_TYPE_LABEL[universe];
  const invitation = universe === "jc" ? "écouter et déclarer" : "écouter";
  const lines = [
    "Bonjour,",
    "",
    `*S.H.M* t’invite à ${invitation} :`,
    "",
    `*${label} du ${formatPodcastDate(episodeDate)}* :`,
    "",
    `_*${title}*_`,
  ];

  if (universe === "jc") {
    lines.push(
      "",
      verseReference
        ? `Confession et déclaration de foi fondées sur ${verseReference}.`
        : "Confession et déclaration de foi."
    );
  } else if (theme) {
    lines.push("", theme);
  }

  lines.push("", "Écoute maintenant avec ce lien :");
  return lines.join("\n");
}
