"use server";

import { createClient } from "@/lib/supabase/server";
import { isRealUser } from "@/lib/supabase/realUser";

// Que Dit la Bible / Rosée Matinale (retour du 05/09) — accessibles à tout
// le monde, comme la lecture de l'article elle-même : compteur simple, sans
// dédoublonnage côté serveur (voir increment_article_likes, migration
// article_likes). Le dédoublonnage "une fois par visiteur" se fait côté
// navigateur (voir LikeButton.tsx) — best-effort assumé, cohérent avec le
// fait que ces catégories restent volontairement ouvertes sans compte.
export async function likeArticlePublic(articleId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("increment_article_likes", { article_id: articleId });
  if (error) return { error: "failed" };
  return {};
}

// La Vie Supérieure (retour du 05/09) — déjà réservée aux comptes connectés
// pour la lecture (voir isRealUser dans publications/[slug]/page.tsx) ;
// même barrière ici. Un like réel par compte, appliqué en base par
// like_article_authenticated (contrainte unique sur article_likes), pas
// seulement côté navigateur.
export async function likeArticleAuthenticated(articleId: string): Promise<{ error?: string; liked?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isRealUser(user)) return { error: "auth-required" };

  const { data, error } = await supabase.rpc("like_article_authenticated", { p_article_id: articleId });
  if (error) return { error: "failed" };
  // "liked" indique si CE clic a effectivement ajouté le like (false = déjà
  // aimé par ce compte auparavant, l'appel n'a rien changé) — sert juste à
  // ne pas ré-incrémenter le compteur affiché côté client si ce n'était pas
  // nécessaire.
  return { liked: Boolean(data) };
}
