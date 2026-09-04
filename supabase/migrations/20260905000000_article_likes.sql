-- Bouton "J'aime" sur les articles (retour du 05/09) — accès calqué sur
-- l'accès déjà en place pour la lecture : Que Dit la Bible et Rosée
-- Matinale sont publics (compteur simple, dédoublonné côté navigateur
-- seulement, best-effort) ; La Vie Supérieure est déjà réservée aux
-- comptes connectés (dédoublonné ici pour de vrai, en base, un comme
-- déjà décidé un like par compte).

alter table public.articles add column if not exists like_count integer not null default 0;

-- Un comme par compte connecté et par article (La Vie Supérieure
-- uniquement) — jamais rempli pour Que Dit la Bible/Rosée Matinale, qui
-- n'ont pas de compte à associer à un like.
create table if not exists public.article_likes (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (article_id, user_id)
);

alter table public.article_likes enable row level security;

-- Un utilisateur ne peut lire que ses propres likes (pour savoir, à
-- l'arrivée sur la page, si le bouton doit déjà apparaître activé) ;
-- aucune policy d'insertion/suppression directe — toute écriture passe
-- par like_article_authenticated() ci-dessous (security definer), jamais
-- par un insert direct depuis le client.
create policy "Utilisateur : lecture de ses propres likes" on public.article_likes for select using (auth.uid() = user_id);
create policy "Admin : lecture de tous les likes" on public.article_likes for select using (public.is_admin());

-- Compteur public, sans dédoublonnage serveur (Que Dit la Bible, Rosée
-- Matinale) — le dédoublonnage par visiteur est fait côté navigateur
-- (localStorage), best-effort assumé : ces catégories sont accessibles
-- sans compte, il n'y a rien de plus fiable à quoi s'accrocher côté
-- serveur sans imposer un compte à ces catégories restées volontairement
-- ouvertes.
create function public.increment_article_likes(article_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.articles set like_count = like_count + 1 where id = article_id and status = 'published';
$$;

grant execute on function public.increment_article_likes(uuid) to anon, authenticated;

-- Version authentifiée (La Vie Supérieure) — un like réel par compte,
-- appliqué en base (contrainte unique sur article_likes), pas seulement
-- côté navigateur. Refuse explicitement une session anonyme (le panier
-- crée une session anonyme pour tout visiteur, même non connecté — voir
-- isRealUser côté application) : "connecté" veut dire un vrai compte,
-- jamais cette session anonyme technique.
create function public.like_article_authenticated(p_article_id uuid)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_rows int;
begin
  if auth.uid() is null or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then
    raise exception 'Un compte connecté est requis pour aimer cet article.';
  end if;

  insert into public.article_likes (article_id, user_id)
  values (p_article_id, auth.uid())
  on conflict (article_id, user_id) do nothing;
  get diagnostics v_rows = row_count;

  if v_rows > 0 then
    update public.articles set like_count = like_count + 1 where id = p_article_id and status = 'published';
    return true;
  end if;
  -- Déjà aimé par ce compte auparavant (conflit sur la contrainte unique) —
  -- pas une erreur, juste "rien à faire de plus" : l'appelant sait déjà
  -- que le bouton était déjà à l'état "aimé" avant même ce clic.
  return false;
end;
$$;

grant execute on function public.like_article_authenticated(uuid) to authenticated;
