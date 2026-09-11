-- V2 Lot 11 (11/09) — Agenda/Événements, nouvelle fonctionnalité additive.
-- Origine : prototype-html/index.html § .events-section (accueil) montre un
-- "prochain rendez-vous" + des "événements passés", sans équivalent dans
-- aucune donnée ni écran admin existant (repéré en construisant l'accueil
-- au Lot 3, contenu laissé provisoirement en dur, jamais présenté comme
-- terminé). Décidé avec Serge : traité comme les autres types de contenu du
-- CMS, table dédiée + admin CRUD, avant la bascule finale.
--
-- Statut "à venir"/"passé" volontairement PAS stocké en colonne — calculé
-- depuis end_date (ou start_date si pas de date de fin), même principe que
-- l'entrée du jour Rosée Matinale/Je Confesse (jamais un champ à
-- resynchroniser manuellement qui pourrait devenir faux avec le temps).
-- "visible" reste un champ à part : un événement peut être masqué
-- indépendamment de sa date (brouillon en préparation, erreur de saisie
-- corrigée sans republier tout de suite).

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  -- Texte libre plutôt qu'un enum (cahier : "type (conférence, rencontre…)"
  -- donne des exemples, pas une liste fermée) — une nouvelle catégorie
  -- d'événement ne doit jamais nécessiter une migration.
  type text not null default 'Conférence',
  description text,
  start_date date not null,
  end_date date,
  location text,
  external_url text,
  visible boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_start_date_idx on public.events (start_date);
create index events_visible_idx on public.events (visible);

alter table public.events enable row level security;

create policy "Public : lecture des événements visibles" on public.events for select using (visible = true);
create policy "Admin : lecture de tous les événements" on public.events for select using (public.is_admin());
create policy "Admin : création d'événements" on public.events for insert with check (public.is_admin());
create policy "Admin : modification d'événements" on public.events for update using (public.is_admin());
create policy "Admin : suppression d'événements" on public.events for delete using (public.is_admin());
