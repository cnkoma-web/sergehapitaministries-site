import type { User } from "@supabase/supabase-js";

// Depuis la Phase 5, TOUT visiteur a une session (anonyme incluse, pour le
// panier — voir CartSessionBootstrap). "Boolean(user)" ne suffit donc plus
// nulle part pour détecter un vrai compte connecté : il faut explicitement
// exclure les sessions anonymes.
export function isRealUser(user: User | null | undefined): user is User {
  return !!user && !user.is_anonymous;
}
