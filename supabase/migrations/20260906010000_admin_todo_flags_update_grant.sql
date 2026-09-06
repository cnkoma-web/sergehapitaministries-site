-- Bug confirmé (retour du 06/09) : les cases "lu" / "traité" / "expédiée" de
-- l'admin ne se mettaient jamais réellement à jour en base. La migration qui
-- a ajouté ces trois colonnes (20260829010000_dashboard_todo_flags.sql) n'a
-- jamais accordé de privilège UPDATE dessus, ni ajouté de policy RLS
-- l'autorisant — seuls SELECT et/ou INSERT existaient sur ces tables. Chaque
-- clic sur "Marquer lu" / "Marquer traité" / "Marquer expédiée" échouait donc
-- silencieusement (le code de ces actions n'a jamais vérifié l'erreur
-- renvoyée) : le compteur de notifications du tableau de bord ne pouvait
-- jamais baisser, quoi que fasse Serge.
--
-- Portée volontairement étroite : GRANT UPDATE limité à la seule colonne
-- concernée sur chaque table (pas un accès UPDATE général) — orders en
-- particulier a un commentaire explicite ailleurs indiquant que le passage
-- au statut 'paid'/'failed' ne doit jamais se faire autrement que par le
-- webhook Stripe (service_role, qui contourne de toute façon la RLS) ; cette
-- policy n'ouvre qu'un chemin admin pour la case "expédiée", rien d'autre.

create policy "Admin : marquer un message de contact comme lu"
  on public.contact_submissions for update
  using (public.is_admin())
  with check (public.is_admin());
grant update (read) on public.contact_submissions to authenticated;

create policy "Admin : marquer une demande d'invitation comme traitee"
  on public.invitation_submissions for update
  using (public.is_admin())
  with check (public.is_admin());
grant update (handled) on public.invitation_submissions to authenticated;

create policy "Admin : marquer une commande comme expediee"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());
grant update (shipped) on public.orders to authenticated;
