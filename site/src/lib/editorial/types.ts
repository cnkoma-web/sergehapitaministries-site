import type { PublicationDraft } from "@/lib/content/publicationValidation";
export type EditorialDraft = PublicationDraft & {
  editorial_audit?: { version:string; profile:{minimum:number;maximum:number;target:number;reference_ids:string[];reference_dates:string[];reference_words:number[];cutoff:string}; body_words:number; analysis:unknown;review:unknown;source_hash:string;content_hash:string;completed_at:string };
  seo_keywords: string[];
  image_prompt: string;
  image_bytes?: number;
  image_width?: number;
  image_height?: number;
  image_drive_file_id?: string;
  image_source_hash?: string;
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

