import type { PublicationDraft } from "@/lib/content/publicationValidation";
export type EditorialDraft = PublicationDraft & {
  seo_keywords: string[];
  image_prompt: string;
  image_bytes?: number;
  image_width?: number;
  image_height?: number;
};
export type EditorialJob = {
  id: string;
  article_date: string;
  type: "rm" | "jc" | "qdlb";
  source: string;
  source_hash: string;
  draft: EditorialDraft | null;
  draft_hash: string | null;
  status: string;
  approved_hash: string | null;
  approved_by: string | null;
  article_id: string | null;
  public_url: string | null;
  last_error: string | null;
  verified_at: string | null;
  lease_token: string | null;
};
