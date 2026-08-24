import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
  if (!user) redirect("/compte?tab=login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .single();

  return (
    <>
      <section className="util-hero">
        <div className="wrap">
          <h1>Mon compte</h1>
          <p>Gérez vos informations, suivez vos commandes et votre accès à La Vie Supérieure.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <DashTabs userId={user.id} firstName={profile?.first_name ?? ""} email={user.email ?? ""} />
      </section>
    </>
  );
}
