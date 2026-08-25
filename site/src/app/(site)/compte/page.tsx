import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isRealUser } from "@/lib/supabase/realUser";
import AuthTabs from "@/components/account/AuthTabs";

const title = "Mon compte | Serge Hapita Ministries";
const description = "Connectez-vous ou créez un compte Serge Hapita Ministries.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/compte" },
  robots: { index: false, follow: true },
};

export default async function ComptePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (isRealUser(user)) redirect("/mon-compte");

  const { tab } = await searchParams;
  const initialTab = tab === "signup" ? "signup" : "login";

  return (
    <>
      <section className="util-hero">
        <div className="wrap">
          <h1>Mon compte</h1>
          <p>
            Connectez-vous ou créez un compte pour accéder à La Vie Supérieure, suivre vos
            commandes et laisser vos avis.
          </p>
        </div>
      </section>

      <section className="account-section">
        <div className="wrap">
          <AuthTabs initialTab={initialTab} />
        </div>
      </section>
    </>
  );
}
