-- File éditoriale distincte des articles ; toute publication passe par le CMS.
create table public.editorial_jobs (
  id uuid primary key default gen_random_uuid(),
  article_date date not null,
  type text not null check (type in ('rm','jc','qdlb')),
  source text not null,
  source_hash text not null,
  source_revision text,
  draft jsonb,
  draft_hash text,
  status text not null default 'collected' check (status in ('collected','writing','review','blocked','approved','publishing','published','failed')),
  approved_hash text,
  approved_by text,
  approved_at timestamptz,
  article_id uuid references public.articles(id) on delete restrict,
  public_url text,
  verified_at timestamptz,
  last_error text,
  attempts integer not null default 0 check (attempts between 0 and 100),
  lease_token uuid,
  lease_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(article_date,type),
  check (status not in ('approved','publishing','published') or
    (approved_hash is not null and approved_hash = draft_hash and approved_by is not null and approved_at is not null))
);
create index editorial_jobs_pending on public.editorial_jobs(status,article_date);
alter table public.editorial_jobs enable row level security;
revoke all on public.editorial_jobs from anon,authenticated;
grant select,insert,update on public.editorial_jobs to authenticated;
grant all on public.editorial_jobs to service_role;
create policy editorial_admin_select on public.editorial_jobs for select to authenticated using ((select public.is_admin()));
create policy editorial_admin_insert on public.editorial_jobs for insert to authenticated with check ((select public.is_admin()));
create policy editorial_admin_update on public.editorial_jobs for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create table public.editorial_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  target_date date not null,
  status text not null check (status in ('ok','failed')),
  detail text not null
);
alter table public.editorial_runs enable row level security;
revoke all on public.editorial_runs from anon,authenticated;
grant select on public.editorial_runs to authenticated;
grant all on public.editorial_runs to service_role;
create policy editorial_runs_admin_select on public.editorial_runs for select to authenticated using ((select public.is_admin()));
