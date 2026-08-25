-- Vidéos (predications/enseignements/temoignages). Reprend le même modèle de
-- sécurité que le reste (RLS + GRANT, lecture publique du contenu actif,
-- écriture admin). Table volontairement vide au départ : les 6 emplacements
-- placeholder de la maquette (cahier Partie 4 : titres/liens YouTube réels à
-- fournir par Serge) ne sont pas de vraies vidéos à simuler en base — la page
-- publique recrée ces emplacements visuels vides tant qu'il n'y a pas assez
-- de vraies vidéos par catégorie, sans qu'aucune fausse donnée ne soit stockée.

create type public.video_category as enum ('predications', 'enseignements', 'temoignages');

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category public.video_category not null,
  youtube_url text,
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.videos enable row level security;

create policy "Public : lecture des vidéos actives" on public.videos for select using (active = true);
create policy "Admin : lecture de toutes les vidéos" on public.videos for select using (public.is_admin());
create policy "Admin : création de vidéos" on public.videos for insert with check (public.is_admin());
create policy "Admin : modification de vidéos" on public.videos for update using (public.is_admin());
create policy "Admin : suppression de vidéos" on public.videos for delete using (public.is_admin());

create trigger set_updated_at before update on public.videos for each row execute function public.set_updated_at();

grant select on public.videos to anon, authenticated;
grant insert, update, delete on public.videos to authenticated;
