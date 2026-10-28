/**
 * Contrôles éditoriaux partagés par le futur circuit de préparation.
 * Cette fonction ne publie rien et ne contourne aucune action du CMS.
 */
export type PublicationKind = "rm" | "jc" | "qdlb" | "vs";

export type PublicationDraft = {
  type: PublicationKind;
  title: string;
  article_date: string;
  body: string;
  verse_text?: string | null;
  verse_reference?: string | null;
  excerpt?: string | null;
  prayer?: string | null;
  further_verses?: { reference: string; text: string }[];
  cover_url?: string | null;
  cover_alt?: string | null;
  author_name?: string | null;
};

export type ValidationIssue = {
  field: keyof PublicationDraft | "image";
  message: string;
};

export function validatePublicationDraft(draft: PublicationDraft): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const required = (field: keyof PublicationDraft, label: string) => {
    if (!String(draft[field] ?? "").trim()) {
      issues.push({ field, message: `${label} obligatoire.` });
    }
  };

  required("title", "Titre");
  required("article_date", "Date");
  required("body", "Corps");
  if (draft.article_date && (!/^\d{4}-\d{2}-\d{2}$/.test(draft.article_date) || !Number.isFinite(new Date(draft.article_date + "T12:00:00Z").getTime()) || new Date(draft.article_date + "T12:00:00Z").toISOString().slice(0, 10) !== draft.article_date)) {
    issues.push({ field: "article_date", message: "Date au format AAAA-MM-JJ." });
  }

  if (draft.type === "rm") {
    required("verse_text", "Chapeau");
  }
  if (draft.type === "jc") {
    required("verse_reference", "Référence biblique");
    required("verse_text", "Verset biblique");
  }
  if (draft.type === "qdlb") {
    required("excerpt", "Chapeau");
    required("verse_reference", "Référence biblique");
    required("verse_text", "Verset biblique");
    for (const verse of draft.further_verses ?? []) {
      if (!verse.reference.trim() || !verse.text.trim()) {
        issues.push({ field: "further_verses", message: "Chaque verset complémentaire exige une référence et un texte." });
      }
    }
  }

  if (draft.type === "rm" || draft.type === "jc") {
    if (draft.author_name?.trim()) {
      issues.push({ field: "author_name", message: "Cette rubrique ne comporte pas d'auteur." });
    }
  } else if (draft.author_name?.trim() !== "Serge Hapita") {
    issues.push({ field: "author_name", message: "Auteur attendu : Serge Hapita." });
  }

  if (draft.cover_url && !draft.cover_alt?.trim()) {
    issues.push({ field: "cover_alt", message: "Texte alternatif obligatoire lorsqu'une image est présente." });
  }

  return issues;
}
