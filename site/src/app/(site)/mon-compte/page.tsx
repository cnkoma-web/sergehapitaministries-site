import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isRealUser } from "@/lib/supabase/realUser";
import { getPublishedArticles } from "@/lib/content/articles";
import DashTabs from "@/components/account/DashTabs";
import SignOutLink from "@/components/account/SignOutLink";

export const metadata: Metadata = {
  title: "Mon compte | Serge Hapita Ministries",
  robots: { index: false, follow: false },
};

export default async function MonComptePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isRealUser(user)) redirect("/compte?tab=login");

  const [{ data: profile }, vsArticles, { data: reviews }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("first_name, last_name").eq("id", user.id).single(),
    getPublishedArticles("vs"),
    supabase
      .from("reviews")
      .select("id, rating, body, status, created_at, books(title), goodies(title)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id, status, subtotal_cents, shipping_cents, total_cents, created_at, order_items(title_snapshot, quantity, unit_price_cents)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const myOrders = (orders ?? []).map((o) => ({
    id: o.id,
    status: o.status,
    subtotalCents: o.subtotal_cents,
    shippingCents: o.shipping_cents,
    totalCents: o.total_cents,
    createdAt: o.created_at,
    items: (Array.isArray(o.order_items) ? o.order_items : []).map((i) => ({
      label: `${i.title_snapshot} ×${i.quantity}`,
      priceCents: i.unit_price_cents * i.quantity,
    })),
  }));

  const myReviews = (reviews ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    body: r.body,
    status: r.status,
    productTitle:
      (Array.isArray(r.books) ? r.books[0]?.title : (r.books as { title: string } | null)?.title) ||
      (Array.isArray(r.goodies) ? r.goodies[0]?.title : (r.goodies as { title: string } | null)?.title) ||
      "Produit",
  }));

  return (
    // V2 (retour du 11/09, Lot 5) — reproduit prototype-html/mon-compte/
    // index.html § .dashboard-shell/.dashboard-head/.dashboard-grid/
    // .dashboard-tabs (commerce.css). Réhabillage visuel uniquement :
    // DashTabs (5 rubriques réelles, dans le même ordre que la maquette)
    // inchangé.
    <div className="v2-dashboard-page">
      <div className="v2-commerce-wrap v2-dashboard-shell">
        <div className="v2-dashboard-head">
          <div>
            <p className="v2-eyebrow">
              <span /> Espace personnel
            </p>
            <h1 style={{ margin: 0, fontFamily: "var(--v2-serif)", fontSize: "clamp(45px,6vw,68px)", fontWeight: 500, lineHeight: 1 }}>Mon compte</h1>
            <p style={{ margin: "12px 0 0", color: "var(--v2-muted)" }}>Retrouvez ici vos informations et votre activité.</p>
          </div>
          {/* Position corrigée (chantier /mon-compte, reprise) : § .dashboard-
              head a de la maquette place "Se déconnecter →" ici, jamais dans
              la barre d'onglets latérale (voir SignOutLink.tsx). */}
          <SignOutLink />
        </div>
        <DashTabs
          userId={user.id}
          firstName={profile?.first_name ?? ""}
          lastName={profile?.last_name ?? ""}
          email={user.email ?? ""}
          vsArticles={vsArticles.map((a) => ({ slug: a.slug, title: a.title }))}
          reviews={myReviews}
          orders={myOrders}
        />
      </div>
    </div>
  );
}
