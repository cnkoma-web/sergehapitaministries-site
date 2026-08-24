import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Client Supabase pour les Server Components / Route Handlers.
// Utilise la clé publique (publishable) — les lectures publiques passent par les
// règles RLS de la base, pas par un contournement service_role. La secret key
// (service_role) n'est pas encore configurée — à ajouter uniquement pour les
// opérations admin côté serveur qui en ont réellement besoin (Phase 2+).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Appelé depuis un Server Component : ignorable si un middleware
            // se charge par ailleurs de rafraîchir la session (Phase 3).
          }
        },
      },
    }
  );
}
