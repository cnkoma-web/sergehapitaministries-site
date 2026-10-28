alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text;

update public.profiles as profile
set
  first_name = coalesce(
    profile.first_name,
    nullif(btrim(account.raw_user_meta_data ->> 'first_name'), '')
  ),
  last_name = coalesce(
    profile.last_name,
    nullif(btrim(account.raw_user_meta_data ->> 'last_name'), '')
  )
from auth.users as account
where profile.id = account.id;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    nullif(btrim(new.raw_user_meta_data ->> 'first_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'last_name'), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop policy if exists "Un utilisateur modifie ses informations" on public.profiles;

create policy "Un utilisateur modifie ses informations"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

revoke update on table public.profiles from authenticated;
grant update (first_name, last_name) on table public.profiles to authenticated;
