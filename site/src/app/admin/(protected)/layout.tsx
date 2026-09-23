import "@/app/admin-mobile.css";
import "@/app/admin-lot2.css";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import AdminSidebarNav from "@/components/admin/AdminSidebarNav";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  const account = (
    <form action={signOut} className="admin-signout">
      <button type="submit">Se déconnecter<span>{admin.user.email}</span></button>
    </form>
  );

  return (
    <div className="admin-shell">
      <div className="admin-layout">
        <aside className="admin-sidebar admin-sidebar-desktop" aria-label="Navigation d’administration">
          <h1>Administration</h1>
          <nav><AdminSidebarNav /></nav>
          {account}
        </aside>

        <header className="admin-mobile-header">
          <Link href="/admin" className="admin-mobile-brand">SHM <span>Admin</span></Link>
          <details className="admin-mobile-menu">
            <summary aria-label="Ouvrir la navigation"><span aria-hidden="true">☰</span> Menu</summary>
            <div className="admin-mobile-menu-panel">
              <nav aria-label="Navigation d’administration"><AdminSidebarNav /></nav>
              {account}
            </div>
          </details>
        </header>

        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
