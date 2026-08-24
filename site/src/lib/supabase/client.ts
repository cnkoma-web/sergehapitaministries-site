import { createBrowserClient } from "@supabase/ssr";

// Client Supabase pour les Client Components ("use client").
// Utilise la clé publique (publishable) — jamais la secret key ici.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
