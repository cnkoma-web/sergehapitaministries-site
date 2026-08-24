-- Phase 2 — socle admin + contenus transverses
-- Tables : profils (rôle admin/visiteur), ticker, bibliothèque de statistiques,
-- textes d'interface (nav/footer/CTA). RLS : lecture publique du contenu actif,
-- écriture réservée aux comptes marqués admin.
--
-- À exécuter une fois dans l'éditeur SQL du dashboard Supabase (Project > SQL Editor).

-- ============================================================
-- 1. Profils utilisateurs + rôle admin
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'visitor' check (role in ('visitor', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Un utilisateur voit son propre profil"
  on public.profiles for select
  using (auth.uid() = id);

-- Crée automatiquement une ligne profils (rôle visiteur par défaut) à chaque inscription.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Fonction utilisée par les policies RLS des tables ci-dessous : vrai si
-- l'utilisateur courant a le rôle admin. SECURITY DEFINER pour pouvoir lire
-- la table profiles indépendamment des policies RLS de profiles elle-même.
create function public.is_admin()
returns boolean
language sql
security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Déclencheur générique pour maintenir updated_at à jour.
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 2. Bandeau ticker (topbar-track) — liste illimitée, réordonnable
-- ============================================================

create table public.ticker_messages (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  href text,
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ticker_messages enable row level security;

create policy "Public : lecture des messages actifs"
  on public.ticker_messages for select
  using (active = true);

create policy "Admin : lecture de tous les messages"
  on public.ticker_messages for select
  using (public.is_admin());

create policy "Admin : création de messages"
  on public.ticker_messages for insert
  with check (public.is_admin());

create policy "Admin : modification de messages"
  on public.ticker_messages for update
  using (public.is_admin());

create policy "Admin : suppression de messages"
  on public.ticker_messages for delete
  using (public.is_admin());

create trigger set_updated_at
  before update on public.ticker_messages
  for each row execute function public.set_updated_at();

-- Reprend exactement le contenu actuellement codé en dur dans
-- site/src/lib/content/ticker.ts, pour que le branchement en Phase 2 ne change
-- rien de visible sur le site.
insert into public.ticker_messages (text, href, position) values
  ('✝ Dernier livre — Ton Corps T''Écoute, disponible maintenant', '/livres#ton-corps', 0),
  ('Recevez « ParoleDeViePourVous » chaque semaine — S''inscrire', '/#newsletter', 1),
  ('Un ministère depuis Levallois-Perret, France', null, 2);

-- ============================================================
-- 3. Bibliothèque de statistiques (bandeau chiffres clés accueil)
-- ============================================================

create type public.stat_calc_type as enum ('auto_books', 'auto_articles', 'manual');

create table public.stat_definitions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  calc_type public.stat_calc_type not null default 'manual',
  manual_value text,
  active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.stat_definitions enable row level security;

create policy "Public : lecture des stats actives"
  on public.stat_definitions for select
  using (active = true);

create policy "Admin : lecture de toutes les stats"
  on public.stat_definitions for select
  using (public.is_admin());

create policy "Admin : création de stats"
  on public.stat_definitions for insert
  with check (public.is_admin());

create policy "Admin : modification de stats"
  on public.stat_definitions for update
  using (public.is_admin());

create policy "Admin : suppression de stats"
  on public.stat_definitions for delete
  using (public.is_admin());

create trigger set_updated_at
  before update on public.stat_definitions
  for each row execute function public.set_updated_at();

-- Les 4 cases actuelles du cahier §3.8, toutes actives par défaut (comportement
-- identique à aujourd'hui) + quelques entrées de bibliothèque supplémentaires
-- inactives par défaut, que Serge peut activer sans intervention sur le code.
insert into public.stat_definitions (key, label, calc_type, manual_value, active, position) values
  ('ouvrages_publies', 'Ouvrages publiés', 'auto_books', null, true, 0),
  ('publications', 'Publications', 'auto_articles', null, true, 1),
  ('personnes_touchees', 'Personnes touchées', 'manual', null, true, 2),
  ('abonnes_rs', 'Nb abonnés RS', 'manual', null, true, 3),
  ('annees_ministere', 'Années de ministère', 'manual', null, false, 4),
  ('pays_touches', 'Pays touchés', 'manual', null, false, 5),
  ('evenements_an', 'Événements par an', 'manual', null, false, 6);

-- ============================================================
-- 4. Textes d'interface (nav, footer, CTA, réseaux...) — clé/valeur
-- ============================================================

create table public.interface_texts (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.interface_texts enable row level security;

create policy "Public : lecture des textes d'interface"
  on public.interface_texts for select
  using (true);

create policy "Admin : création de textes d'interface"
  on public.interface_texts for insert
  with check (public.is_admin());

create policy "Admin : modification de textes d'interface"
  on public.interface_texts for update
  using (public.is_admin());

create policy "Admin : suppression de textes d'interface"
  on public.interface_texts for delete
  using (public.is_admin());

create trigger set_updated_at
  before update on public.interface_texts
  for each row execute function public.set_updated_at();

-- Reprend le contenu actuellement codé en dur dans site/src/lib/content/
-- (nav.ts, footer.ts) pour un branchement en Phase 2 sans régression visuelle.
-- Le contenu propre à chaque page (hero/CTA) sera ajouté page par page en Phase 4,
-- au fur et à mesure de la migration de chaque gabarit.
insert into public.interface_texts (key, value) values
  ('brand_split.left.label', 'ActesDesFilsDeDieu'),
  ('brand_split.left.href', 'http://www.actedesfilsdedieu.fr'),
  ('brand_split.right.label', 'amDG Éditions'),
  ('brand_split.right.href', 'http://www.amdgeditions.fr'),
  ('footer.description', 'Levallois-Perret, France — un ministère qui révèle Christ au croyant, affermit le chrétien dans l''identité de fils, manifeste Dieu, le Père céleste.'),
  ('footer.copyright', '© {year} Serge Hapita Ministries — Levallois-Perret, France'),
  ('social.youtube', 'https://www.youtube.com/@sergehapita'),
  ('social.instagram', 'https://www.instagram.com/sergehapitaministries/'),
  ('social.tiktok', 'https://www.tiktok.com/@sergehapitaministries'),
  ('social.facebook', 'https://www.facebook.com/profile.php?id=61582211394401');
