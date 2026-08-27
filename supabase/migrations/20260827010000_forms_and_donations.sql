-- Formulaires restants (contact, invitation, prière du salut) et dons Stripe.
-- Contrairement au panier/commandes, ces formulaires doivent pouvoir être
-- soumis même si la session anonyme Supabase n'a pas pu être créée (JS bloqué,
-- anonymous sign-ins désactivés côté dashboard) : on autorise donc l'insertion
-- au rôle "anon" en plus de "authenticated", sans condition de propriétaire.
-- Aucune lecture publique n'est nécessaire (l'utilisateur ne relit jamais sa
-- propre soumission) : seul l'admin peut lire, pour le suivi.

create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  email text not null,
  sujet text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;

create policy "Envoi public du formulaire de contact"
  on public.contact_submissions for insert
  with check (true);

create policy "Admin : lecture des messages de contact"
  on public.contact_submissions for select
  using (public.is_admin());

grant select, insert on public.contact_submissions to anon, authenticated;

create table public.invitation_submissions (
  id uuid primary key default gen_random_uuid(),
  prenom text not null,
  nom text not null,
  email text not null,
  telephone text not null,
  hote text not null,
  pays text not null,
  ville text not null,
  type_invitation text not null,
  ministere_desire text not null,
  theme text not null,
  date_debut date not null,
  date_fin date not null,
  contact_sur_place text,
  frais_couverts text not null,
  comment_connu text,
  message text,
  created_at timestamptz not null default now()
);

alter table public.invitation_submissions enable row level security;

create policy "Envoi public du formulaire d'invitation"
  on public.invitation_submissions for insert
  with check (true);

create policy "Admin : lecture des demandes d'invitation"
  on public.invitation_submissions for select
  using (public.is_admin());

grant select, insert on public.invitation_submissions to anon, authenticated;

create table public.prayer_submissions (
  id uuid primary key default gen_random_uuid(),
  nom text,
  ville text,
  email text not null,
  telephone text,
  accepte_contact boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.prayer_submissions enable row level security;

create policy "Envoi public de la prière du salut"
  on public.prayer_submissions for insert
  with check (true);

create policy "Admin : lecture des prières du salut"
  on public.prayer_submissions for select
  using (public.is_admin());

grant select, insert on public.prayer_submissions to anon, authenticated;

-- ============================================================
-- Dons (widget partenariat.html : fréquence + montant + commentaire)
-- ============================================================

create table public.donations (
  id uuid primary key default gen_random_uuid(),
  -- Comme pour les commandes (cart_and_orders), user_id vient de la session
  -- Supabase courante — anonyme ou réelle, cf. CartSessionBootstrap. Permet à
  -- l'action serveur de relire la ligne qu'elle vient de créer (RLS) sans
  -- ouvrir une lecture publique complète de la table.
  user_id uuid references auth.users (id) on delete set null,
  frequency text not null check (frequency in ('unique', 'mensuel', 'annuel')),
  amount_cents integer not null check (amount_cents > 0),
  comment text,
  email text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'active', 'canceled', 'failed')),
  stripe_checkout_session_id text unique,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.donations enable row level security;

-- Même logique que pour les commandes : la création se fait via l'action
-- serveur (statut 'pending'), la confirmation ('paid'/'active') exclusivement
-- depuis le webhook Stripe via service_role.
create policy "Un utilisateur crée son propre don (statut initial pending)"
  on public.donations for insert
  with check (auth.uid() = user_id and status = 'pending');

create policy "Un utilisateur lit ses propres dons"
  on public.donations for select
  using (auth.uid() = user_id);

create policy "Admin : lecture de tous les dons"
  on public.donations for select
  using (public.is_admin());

create trigger set_updated_at before update on public.donations for each row execute function public.set_updated_at();

grant select, insert on public.donations to authenticated;
