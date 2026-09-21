-- Compteurs atomiques pour les formulaires publics. La table reste dans le
-- schéma public pour être accessible au client serveur Supabase, mais aucun
-- rôle navigateur ne reçoit de droit ni de policy RLS.
create table if not exists public.form_rate_limits (
  scope text not null,
  subject_hash text not null,
  window_started_at timestamptz not null,
  hit_count integer not null default 1 check (hit_count > 0),
  expires_at timestamptz not null,
  primary key (scope, subject_hash, window_started_at),
  check (char_length(scope) between 1 and 80),
  check (subject_hash ~ '^[0-9a-f]{64}$')
);

alter table public.form_rate_limits enable row level security;
revoke all on table public.form_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on table public.form_rate_limits to service_role;

create index if not exists form_rate_limits_expires_at_idx
  on public.form_rate_limits (expires_at);

create or replace function public.register_form_attempt(
  p_scope text,
  p_subject_hash text,
  p_window_seconds integer,
  p_limit integer
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_window_started_at timestamptz;
  v_count integer;
begin
  if p_scope is null or char_length(p_scope) not between 1 and 80
     or p_subject_hash !~ '^[0-9a-f]{64}$'
     or p_window_seconds not between 10 and 86400
     or p_limit not between 1 and 1000 then
    raise exception 'invalid rate limit parameters';
  end if;

  v_window_started_at := to_timestamp(
    floor(extract(epoch from v_now) / p_window_seconds) * p_window_seconds
  );

  insert into public.form_rate_limits (
    scope,
    subject_hash,
    window_started_at,
    hit_count,
    expires_at
  )
  values (
    p_scope,
    p_subject_hash,
    v_window_started_at,
    1,
    v_window_started_at + make_interval(secs => p_window_seconds * 2)
  )
  on conflict (scope, subject_hash, window_started_at)
  do update set hit_count = public.form_rate_limits.hit_count + 1
  returning hit_count into v_count;

  -- Nettoyage amorti : environ une requête sur cinquante supprime les
  -- anciennes fenêtres, sans stocker durablement les empreintes techniques.
  if random() < 0.02 then
    delete from public.form_rate_limits where expires_at < v_now;
  end if;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.register_form_attempt(text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.register_form_attempt(text, text, integer, integer)
  to service_role;
