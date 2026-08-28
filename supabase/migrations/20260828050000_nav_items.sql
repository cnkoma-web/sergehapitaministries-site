-- Cahier — exigence transversale : le menu de navigation principal doit
-- devenir une vraie liste gérée par Serge (ajout/suppression/renommage/
-- réordonnancement de liens), pas seulement des libellés éditables sur une
-- structure figée dans le code (ancienne approche via interface_texts,
-- conservée telle quelle en base mais plus utilisée par le menu désormais).
--
-- Un item de premier niveau est soit un lien simple (href non nul, pas
-- d'enfants), soit un menu déroulant (href nul, des enfants avec ce parent_id).
-- Les enfants sont toujours des liens simples (pas de sous-sous-menu).

create table public.nav_items (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.nav_items (id) on delete cascade,
  label text not null,
  href text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.nav_items enable row level security;

create policy "Public : lecture du menu" on public.nav_items for select using (true);
create policy "Admin : création d'items de menu" on public.nav_items for insert with check (public.is_admin());
create policy "Admin : modification d'items de menu" on public.nav_items for update using (public.is_admin());
create policy "Admin : suppression d'items de menu" on public.nav_items for delete using (public.is_admin());

create trigger set_updated_at before update on public.nav_items for each row execute function public.set_updated_at();

grant select on public.nav_items to anon, authenticated;
grant insert, update, delete on public.nav_items to authenticated;

-- Reprend exactement la structure actuellement codée en dur dans
-- site/src/lib/content/nav.ts, pour un branchement sans régression visuelle.
do $$
declare
  a_propos_id uuid;
  publications_id uuid;
begin
  insert into public.nav_items (label, href, position) values ('Accueil', '/', 0);

  insert into public.nav_items (label, href, position) values ('À propos', null, 1) returning id into a_propos_id;
  insert into public.nav_items (parent_id, label, href, position) values
    (a_propos_id, 'De Serge', '/de-serge', 0),
    (a_propos_id, 'Livres', '/livres', 1),
    (a_propos_id, 'Vidéos', '/videos', 2),
    (a_propos_id, 'Invitation', '/invitation', 3),
    (a_propos_id, 'Partenariat', '/partenariat', 4);

  insert into public.nav_items (label, href, position) values ('Connaître Jésus', '/connaitre-jesus', 2);

  insert into public.nav_items (label, href, position) values ('Publications', null, 3) returning id into publications_id;
  insert into public.nav_items (parent_id, label, href, position) values
    (publications_id, 'Que Dit la Bible ?', '/publications#que-dit-la-bible', 0),
    (publications_id, 'La Vie Supérieure', '/publications#vie-superieure', 1),
    (publications_id, 'Rosée Matinale', '/rosee-matinale', 2);

  insert into public.nav_items (label, href, position) values
    ('Boutique', '/boutique', 4),
    ('Soutenir', '/partenariat', 5),
    ('Contact', '/contact', 6);
end $$;
