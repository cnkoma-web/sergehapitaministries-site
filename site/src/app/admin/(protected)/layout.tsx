import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentAdmin } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <Link href="/admin">Administration — Serge Hapita Ministries</Link>
        <nav>
          <Link href="/admin/livres">Livres</Link>
          <Link href="/admin/boutique">Boutique</Link>
          <Link href="/admin/publications">Publications</Link>
          <Link href="/admin/rosee-matinale">Rosée Matinale</Link>
          <Link href="/admin/avis">Avis</Link>
          <Link href="/admin/ticker">Ticker</Link>
          <Link href="/admin/stats">Statistiques</Link>
          <Link href="/admin/textes">Textes</Link>
          <form action={signOut}>
            <button type="submit">Se déconnecter ({admin.user.email})</button>
          </form>
        </nav>
      </div>
      <main className="admin-main">{children}</main>
    </div>
  );
}
