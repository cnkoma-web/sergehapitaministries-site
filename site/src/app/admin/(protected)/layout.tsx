import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import AdminSidebarNav from "@/components/admin/AdminSidebarNav";

// Sidebar verticale + zone de contenu (cahier Partie 5 §6.1) — remplace l'ancienne
// barre horizontale. Toutes les sections de l'admin s'affichent dans .admin-main,
// qu'elles aient déjà été reconstruites au nouveau modèle liste/détail ou non.
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
      <div className="admin-layout">
        <nav className="admin-sidebar">
          <h1>Administration</h1>
          <AdminSidebarNav />
          <form action={signOut}>
            <button type="submit">Se déconnecter ({admin.user.email})</button>
          </form>
        </nav>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
