-- V2 Lot 9 (11/09) — Podcast : nouvelle fonctionnalité additive, distincte
-- des 4 catégories existantes mais qui les référence (cahier : "univers
-- réutilise les 4 catégories existantes"). Table entièrement nouvelle,
-- aucune colonne existante touchée.
--
-- Synchronisation Ausha : Serge n'a pas encore souscrit de plan Ausha au
-- 11/09 (confirmé) — cette migration crée uniquement le stockage. Aucune
-- tâche de synchronisation RSS/API n'est câblée ici : en attendant, les
-- épisodes sont saisis manuellement dans l'admin (audio_url pointe alors
-- vers le lien direct qu'Ausha fournit pour un épisode publié). Le
-- mécanisme de synchronisation réel (RSS le plus probable, ou API) sera
-- construit une fois le plan Ausha choisi, sans reprendre cette migration
-- — colonnes déjà prêtes à recevoir ces données.

create type public.podcast_universe as enum ('qdlb', 'vs', 'rm', 'jc');
create type public.podcast_status as enum ('draft', 'published');

create table public.podcast_episodes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  universe public.podcast_universe not null,
  title text not null,
  -- Thème optionnel (cahier) — distinct du titre, sert de sous-titre/mot-clé
  -- pour une proclamation Je Confesse qui n'a pas de titre éditorial propre.
  theme text,
  episode_date date not null default current_date,
  audio_url text not null,
  duration_seconds integer,
  cover_url text,
  share_image_url text,
  -- Lien optionnel vers l'article/l'entrée écrite correspondante (cahier :
  -- "lien vers le contenu écrit associé") — jamais de contrainte de clé
  -- étrangère stricte vers articles(id) : un épisode de La Vie Supérieure
  -- pourrait exister sans article écrit correspondant (format audio
  -- original), l'inverse doit rester possible.
  linked_article_id uuid references public.articles(id) on delete set null,
  status public.podcast_status not null default 'draft',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index podcast_episodes_universe_idx on public.podcast_episodes (universe);
create index podcast_episodes_status_idx on public.podcast_episodes (status);

alter table public.podcast_episodes enable row level security;

create policy "Public : lecture des épisodes publiés" on public.podcast_episodes for select using (status = 'published');
create policy "Admin : lecture de tous les épisodes" on public.podcast_episodes for select using (public.is_admin());
create policy "Admin : création d'épisodes" on public.podcast_episodes for insert with check (public.is_admin());
create policy "Admin : modification d'épisodes" on public.podcast_episodes for update using (public.is_admin());
create policy "Admin : suppression d'épisodes" on public.podcast_episodes for delete using (public.is_admin());
