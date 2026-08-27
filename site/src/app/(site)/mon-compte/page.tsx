import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isRealUser } from "@/lib/supabase/realUser";
import { getPublishedArticles } from "@/lib/content/articles";
import DashTabs from "@/components/account/DashTabs";

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
    supabase.from("profiles").select("first_name").eq("id", user.id).single(),
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
    <>
      <section className="util-hero">
        <div className="wrap">
          <h1>Mon compte</h1>
          <p>Gérez vos informations, suivez vos commandes et votre accès à La Vie Supérieure.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <DashTabs
          userId={user.id}
          firstName={profile?.first_name ?? ""}
          email={user.email ?? ""}
          vsArticles={vsArticles.map((a) => ({ slug: a.slug, title: a.title }))}
          reviews={myReviews}
          orders={myOrders}
        />
      </section>
    </>
  );
}
