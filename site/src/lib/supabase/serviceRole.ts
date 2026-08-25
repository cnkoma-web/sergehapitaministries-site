import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ⚠️ Client "service_role" — contourne TOUTES les policies RLS. Réservé au
// webhook Stripe (src/app/api/stripe/webhook/route.ts), qui n'a par nature
// aucune session utilisateur (appel serveur-à-serveur de Stripe) mais doit
// pouvoir confirmer une commande après vérification cryptographique de la
// signature du webhook. Ne JAMAIS importer ce fichier depuis un composant,
// une Server Action déclenchée par le navigateur, ou toute route accessible
// sans cette vérification de signature préalable.
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante — voir src/app/api/stripe/webhook/route.ts");
  }
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}
