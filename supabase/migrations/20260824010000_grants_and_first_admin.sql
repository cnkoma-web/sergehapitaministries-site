-- Correctif : les policies RLS ne suffisent pas seules, il faut aussi les
-- privilèges Postgres de base (GRANT) sur les rôles anon/authenticated —
-- oubliés dans la première migration. Sans ça, toute requête est refusée
-- avant même que la RLS ne soit évaluée ("permission denied").
--
-- À exécuter dans le SQL Editor Supabase, après la première migration.

grant usage on schema public to anon, authenticated;

-- Contenu public (lecture par tout le monde, y compris visiteurs non connectés)
grant select on public.ticker_messages to anon, authenticated;
grant select on public.stat_definitions to anon, authenticated;
grant select on public.interface_texts to anon, authenticated;

-- Écriture réservée aux admins — le GRANT autorise la tentative, la policy RLS
-- (public.is_admin()) décide ensuite si la ligne est effectivement acceptée.
grant insert, update, delete on public.ticker_messages to authenticated;
grant insert, update, delete on public.stat_definitions to authenticated;
grant insert, update, delete on public.interface_texts to authenticated;

-- Un utilisateur connecté doit pouvoir lire (et le trigger, créer) sa propre ligne de profil.
grant select on public.profiles to authenticated;
grant insert on public.profiles to authenticated;

-- ============================================================
-- Premier compte admin — à adapter si vous changez d'email.
-- ============================================================
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'actesdesfilsdedieu@gmail.com');

-- Vérification (doit renvoyer une ligne avec role = 'admin') :
-- select id, role from public.profiles
-- where id = (select id from auth.users where email = 'actesdesfilsdedieu@gmail.com');
