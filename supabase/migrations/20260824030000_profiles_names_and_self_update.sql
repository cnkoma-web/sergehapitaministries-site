-- Phase 3 — authentification utilisateurs réelle.
-- Ajoute prénom/nom au profil (formulaire d'inscription du cahier), et autorise
-- un utilisateur à modifier SON PROPRE prénom/nom — jamais son rôle, qui reste
-- réservé aux admins via un GRANT au niveau colonne (pas seulement la policy RLS,
-- qui ne filtre que les lignes, pas les colonnes modifiables).

alter table public.profiles
  add column first_name text,
  add column last_name text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  return new;
end;
$$;

grant update (first_name, last_name) on public.profiles to authenticated;

create policy "Un utilisateur modifie son propre prénom/nom"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
