-- Cahier Partie 5 §6.3 : liste de catégories/thèmes gérée par Serge (pas de
-- <select> à options codées en dur), au-dessus des 3 types fixes d'article
-- (Que Dit la Bible / La Vie Supérieure / Rosée Matinale — qui gardent leur
-- comportement propre : verrouillage, champs verset, page du jour). Une
-- catégorie peut être créée à la volée depuis le formulaire d'article
-- ("+ Créer une catégorie"), et un article peut appartenir à plusieurs
-- catégories à la fois (cases à cocher multiples, pas un choix unique).

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Public : lecture des catégories" on public.categories for select using (true);
create policy "Admin : création de catégories" on public.categories for insert with check (public.is_admin());
create policy "Admin : modification de catégories" on public.categories for update using (public.is_admin());
create policy "Admin : suppression de catégories" on public.categories for delete using (public.is_admin());

grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;

create table public.article_categories (
  article_id uuid not null references public.articles (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (article_id, category_id)
);

alter table public.article_categories enable row level security;

create policy "Public : lecture des catégories d'articles publiés"
  on public.article_categories for select
  using (article_id in (select id from public.articles where status = 'published'));
create policy "Admin : lecture de toutes les associations"
  on public.article_categories for select
  using (public.is_admin());
create policy "Admin : gestion des associations article/catégorie"
  on public.article_categories for all
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.article_categories to anon, authenticated;
grant insert, delete on public.article_categories to authenticated;
