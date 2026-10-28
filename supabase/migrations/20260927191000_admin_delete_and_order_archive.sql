-- Gestion administrative des demandes, messages et commandes de test.
grant delete on table public.contact_submissions to authenticated;
grant delete on table public.invitation_submissions to authenticated;

create policy "Admin : suppression des messages de contact"
on public.contact_submissions for delete using (public.is_admin());

create policy "Admin : suppression des demandes d'invitation"
on public.invitation_submissions for delete using (public.is_admin());

alter table public.orders add column archived_at timestamptz;
create index orders_archived_at_idx on public.orders (archived_at);
comment on column public.orders.archived_at is 'Masque une commande de la liste administrative sans effacer la trace Stripe.';
