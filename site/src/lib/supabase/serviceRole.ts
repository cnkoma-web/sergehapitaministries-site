import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ⚠️ Client "service_role" — contourne TOUTES les policies RLS. Réservé au
// webhook Stripe (signature Stripe vérifiée) et au rattachement d'une commande
// anonyme (ancienne session Supabase ET session du compte permanent vérifiées
// côté serveur). Ne JAMAIS importer ce fichier depuis un composant client ni
// depuis une action qui n'a pas authentifié explicitement toutes les identités
// concernées avant l'écriture privilégiée.
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante — voir src/app/api/stripe/webhook/route.ts");
  }
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}
