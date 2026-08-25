"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { computeReadingTime } from "@/lib/readingTime";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseFurtherVerses(raw: string): { reference: string; text: string }[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [reference, ...rest] = line.split("|");
      return { reference: reference.trim(), text: rest.join("|").trim() };
    })
    .filter((v) => v.reference && v.text);
}

function parseKeywords(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function addArticle(formData: FormData) {
  const supabase = await createClient();
  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  if (!title || !["qdlb", "vs"].includes(type)) return;

  const body = String(formData.get("body") ?? "").trim();

  await supabase.from("articles").insert({
    type,
    slug: slugify(title),
    title,
    article_date: String(formData.get("article_date") ?? "") || new Date().toISOString().slice(0, 10),
    excerpt: String(formData.get("excerpt") ?? "").trim() || null,
    verse_reference: String(formData.get("verse_reference") ?? "").trim() || null,
    verse_text: String(formData.get("verse_text") ?? "").trim() || null,
    body: body || null,
    further_verses: parseFurtherVerses(String(formData.get("further_verses") ?? "")),
    toc_keywords: parseKeywords(String(formData.get("toc_keywords") ?? "")),
    access: String(formData.get("access") ?? "free"),
    status: String(formData.get("status") ?? "draft"),
    reading_time_minutes: body ? computeReadingTime(body) : null,
  });

  revalidatePath("/admin/publications");
  revalidatePath("/publications");
}

export async function updateArticle(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  if (!id || !title) return;

  const body = String(formData.get("body") ?? "").trim();

  await supabase
    .from("articles")
    .update({
      title,
      article_date: String(formData.get("article_date") ?? "") || undefined,
      excerpt: String(formData.get("excerpt") ?? "").trim() || null,
      verse_reference: String(formData.get("verse_reference") ?? "").trim() || null,
      verse_text: String(formData.get("verse_text") ?? "").trim() || null,
      body: body || null,
      further_verses: parseFurtherVerses(String(formData.get("further_verses") ?? "")),
      toc_keywords: parseKeywords(String(formData.get("toc_keywords") ?? "")),
      access: String(formData.get("access") ?? "free"),
      status: String(formData.get("status") ?? "draft"),
      reading_time_minutes: body ? computeReadingTime(body) : null,
    })
    .eq("id", id);

  revalidatePath("/admin/publications");
  revalidatePath("/publications");
}

export async function deleteArticle(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  if (!id) return;
  await supabase.from("articles").delete().eq("id", id);
  revalidatePath("/admin/publications");
  revalidatePath("/publications");
}
