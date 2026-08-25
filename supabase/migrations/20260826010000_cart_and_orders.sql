-- Phase 5 — panier persistant + commandes.
-- Le panier "invité" utilise les sessions anonymes Supabase (auth.uid() existe
-- aussi pour un visiteur non connecté) : un seul modèle de propriété partout,
-- pas de mécanisme de fusion séparé à maintenir — quand un visiteur anonyme
-- crée un compte, son auth.uid() ne change pas, son panier suit automatiquement.
--
-- ⚠️ Nécessite d'activer "Allow anonymous sign-ins" dans Supabase
-- (Authentication → Sign In / Providers), sans quoi les visiteurs non connectés
-- n'auront pas de session du tout.

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.carts enable row level security;

create policy "Un utilisateur gère son propre panier"
  on public.carts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_updated_at before update on public.carts for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.carts to authenticated;

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  book_id uuid references public.books (id) on delete cascade,
  goodie_id uuid references public.goodies (id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  variant_size text,
  variant_color text,
  created_at timestamptz not null default now(),
  constraint cart_items_exactly_one_target check ((book_id is not null) <> (goodie_id is not null))
);

alter table public.cart_items enable row level security;

create policy "Un utilisateur gère les articles de son propre panier"
  on public.cart_items for all
  using (cart_id in (select id from public.carts where user_id = auth.uid()))
  with check (cart_id in (select id from public.carts where user_id = auth.uid()));

grant select, insert, update, delete on public.cart_items to authenticated;

-- ============================================================
-- Commandes
-- ============================================================

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  subtotal_cents integer not null default 0,
  total_cents integer not null default 0,
  customer_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- La création se fait via l'action serveur de checkout (session de l'utilisateur,
-- statut 'pending'). La confirmation de paiement (passage à 'paid') se fait
-- exclusivement depuis le webhook Stripe, via la service_role key qui
-- contourne la RLS — jamais depuis le navigateur, jamais sur la seule foi
-- d'une requête cliente : c'est Stripe, après vérification cryptographique de
-- la signature du webhook, qui est la seule source de vérité sur un paiement
-- réellement effectué.
create policy "Un utilisateur crée sa propre commande"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Un utilisateur lit ses propres commandes"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Admin : lecture de toutes les commandes"
  on public.orders for select
  using (public.is_admin());

create trigger set_updated_at before update on public.orders for each row execute function public.set_updated_at();

grant select, insert on public.orders to authenticated;

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  book_id uuid references public.books (id) on delete set null,
  goodie_id uuid references public.goodies (id) on delete set null,
  title_snapshot text not null,
  unit_price_cents integer not null,
  quantity integer not null,
  variant_size text,
  variant_color text
);

alter table public.order_items enable row level security;

create policy "Un utilisateur lit les lignes de ses propres commandes"
  on public.order_items for select
  using (order_id in (select id from public.orders where user_id = auth.uid()));

create policy "Un utilisateur crée les lignes de sa propre commande"
  on public.order_items for insert
  with check (order_id in (select id from public.orders where user_id = auth.uid()));

create policy "Admin : lecture de toutes les lignes de commande"
  on public.order_items for select
  using (public.is_admin());

grant select, insert on public.order_items to authenticated;
