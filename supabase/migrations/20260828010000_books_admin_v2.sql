-- Refonte admin Livres (cahier Partie 5, points 6.1/6.4) : galerie de 5 images
-- max avec position, et statut à 3 valeurs (Actif / Précommande / Masqué) au lieu
-- du simple booléen "active" — la précommande n'a pas sa propre position
-- d'affichage séparée, juste un statut (correction explicite du cahier : une
-- proposition précédente compliquait inutilement la chose).

create table public.book_images (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books (id) on delete cascade,
  url text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.book_images enable row level security;

create policy "Public : lecture des images de livres actifs"
  on public.book_images for select
  using (book_id in (select id from public.books where status <> 'hidden'));
create policy "Admin : lecture de toutes les images de livres"
  on public.book_images for select
  using (public.is_admin());
create policy "Admin : gestion des images de livres"
  on public.book_images for all
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.book_images to anon, authenticated;
grant insert, update, delete on public.book_images to authenticated;

-- Statut à 3 valeurs. Migration des données existantes : active=true -> 'active',
-- active=false -> 'hidden' (comportement identique à avant : rien n'était visible
-- publiquement quand active=false).
alter table public.books add column status text not null default 'active' check (status in ('active', 'precommande', 'hidden'));
update public.books set status = case when active then 'active' else 'hidden' end;

-- L'ancienne colonne "active" reste en base pour ne rien casser côté requêtes non
-- encore migrées, mais n'est plus la source de vérité — "status" l'est désormais.
-- À retirer une fois toutes les requêtes publiques basculées sur "status".
