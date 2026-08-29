import { createClient } from "@/lib/supabase/server";
import { fetchGaVisits30Days } from "./googleAnalytics";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export type KeyStat = { label: string; value: string; trend?: string; source: string };

export async function getSalesAndDonationsStats(): Promise<{ salesCents: number; donationsCents: number }> {
  const supabase = await createClient();
  const since = daysAgoIso(30);

  const [{ data: orders }, { data: donations }] = await Promise.all([
    supabase.from("orders").select("total_cents").eq("status", "paid").gte("created_at", since),
    supabase.from("donations").select("amount_cents").in("status", ["paid", "active"]).gte("created_at", since),
  ]);

  const salesCents = (orders ?? []).reduce((sum, o) => sum + (o.total_cents ?? 0), 0);
  const donationsCents = (donations ?? []).reduce((sum, d) => sum + (d.amount_cents ?? 0), 0);
  return { salesCents, donationsCents };
}

export async function getNewAccountsCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .gte("created_at", daysAgoIso(30));
  return count ?? 0;
}

export async function getMostReadArticle(): Promise<{ title: string; viewCount: number } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("title, view_count")
    .eq("status", "published")
    .order("view_count", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return { title: data.title, viewCount: data.view_count };
}

/** Abonnés newsletter ajoutés dans les 30 derniers jours — approximatif au-delà
 * de 100 inscriptions sur la période (une seule page interrogée), largement
 * suffisant pour le volume actuel. Renvoie null si MailerLite n'est pas
 * configuré, plutôt qu'un chiffre inventé. */
export async function getNewNewsletterSubscribers(): Promise<number | null> {
  const apiKey = process.env.MAILERLITE_API_KEY;
  const groupId = process.env.MAILERLITE_GROUP_ID;
  if (!apiKey || !groupId) return null;

  try {
    const res = await fetch(
      `https://connect.mailerlite.com/api/subscribers?filter[group]=${groupId}&limit=100&sort=-created_at`,
      { headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" }, next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: { created_at?: string }[] };
    const since = Date.now() - THIRTY_DAYS_MS;
    return (body.data ?? []).filter((s) => s.created_at && new Date(s.created_at).getTime() >= since).length;
  } catch {
    return null;
  }
}

export type TodoCounts = {
  pendingReviews: number;
  ordersToShip: number;
  unhandledInvitations: number;
  unreadContact: number;
  failedPayments: number;
};

export async function getTodoCounts(): Promise<TodoCounts> {
  const supabase = await createClient();
  const [{ count: pendingReviews }, { count: ordersToShip }, { count: unhandledInvitations }, { count: unreadContact }, { count: failedOrders }, { count: failedDonations }] =
    await Promise.all([
      supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "paid").eq("shipped", false),
      supabase.from("invitation_submissions").select("id", { count: "exact", head: true }).eq("handled", false),
      supabase.from("contact_submissions").select("id", { count: "exact", head: true }).eq("read", false),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "failed"),
      supabase.from("donations").select("id", { count: "exact", head: true }).eq("status", "failed"),
    ]);

  return {
    pendingReviews: pendingReviews ?? 0,
    ordersToShip: ordersToShip ?? 0,
    unhandledInvitations: unhandledInvitations ?? 0,
    unreadContact: unreadContact ?? 0,
    failedPayments: (failedOrders ?? 0) + (failedDonations ?? 0),
  };
}

export type SalesBreakdown = { books: number; goodies: number; donations: number };

/** Répartition en centimes — livres / boutique / dons, sur les 30 derniers jours. */
export async function getSalesBreakdown(): Promise<SalesBreakdown> {
  const supabase = await createClient();
  const since = daysAgoIso(30);

  const { data: orderItems } = await supabase
    .from("order_items")
    .select("book_id, goodie_id, unit_price_cents, quantity, orders!inner(status, created_at)")
    .eq("orders.status", "paid")
    .gte("orders.created_at", since);

  let books = 0;
  let goodies = 0;
  for (const item of orderItems ?? []) {
    const cents = item.unit_price_cents * item.quantity;
    if (item.book_id) books += cents;
    else if (item.goodie_id) goodies += cents;
  }

  const { donationsCents } = await getSalesAndDonationsStats();
  return { books, goodies, donations: donationsCents };
}

export async function getVisits30Days(): Promise<{ configured: boolean; total?: number; series?: number[] }> {
  const result = await fetchGaVisits30Days();
  if (!result) return { configured: false };
  return { configured: true, total: result.total, series: result.series };
}
