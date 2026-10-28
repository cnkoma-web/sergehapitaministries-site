import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ⚠️ Client "service_role" — contourne TOUTES les policies RLS. Réservé au
// webhook Stripe (signature Stripe vérifiée), au rattachement d'une commande
// anonyme (deux sessions vérifiées côté serveur) et aux formulaires publics
// après validation stricte, Turnstile et limitation de fréquence. Ne JAMAIS
// importer ce fichier depuis un composant client ni l'utiliser avant les
// contrôles propres à l'opération privilégiée.
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante — voir src/app/api/stripe/webhook/route.ts");
  }
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}
