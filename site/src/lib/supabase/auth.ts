import { createClient } from "./server";

// Utilisé par le layout /admin pour vérifier session + rôle. La sécurité réelle
// vient des policies RLS (public.is_admin()) sur chaque table — cette fonction
// ne sert qu'à l'expérience (rediriger proprement), pas de garde de sécurité
// à elle seule.
export async function getCurrentAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return null;

  return { user, role: profile.role };
}
