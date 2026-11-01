create table public.editorial_commands (
 id uuid primary key default gen_random_uuid(),
 article_date date not null check (article_date >= date '2026-10-28'),
 action text not null default 'publish_ready' check (action = 'publish_ready'),
 status text not null default 'queued' check (status in ('queued','running','completed','failed')),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default (now() + interval '15 minutes'),
 finished_at timestamptz,
 requested_by text not null check (length(requested_by) between 1 and 200),
 authorization_hash text not null check (authorization_hash ~ '^[0-9a-f]{64}$'),
 result jsonb,
 constraint editorial_command_short_lived check (expires_at > created_at and expires_at <= created_at + interval '15 minutes')
);
create unique index editorial_commands_one_active_date on public.editorial_commands(article_date) where status in ('queued','running');
alter table public.editorial_commands enable row level security;
revoke all on table public.editorial_commands from anon, authenticated;
grant select,insert,update,delete on table public.editorial_commands to service_role;
comment on table public.editorial_commands is 'Commandes CMS autorisées par une connexion administrative. Identifiant imprévisible, date fixe, validité de 15 minutes et prise exclusive. Aucun accès client public.';

