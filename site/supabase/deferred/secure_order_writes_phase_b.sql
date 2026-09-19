-- DEFERRED — ne pas exécuter avant le déploiement et la vérification du
-- nouveau checkout serveur. Déplacer alors ce fichier vers migrations/ avec
-- un nouvel horodatage, puis l'appliquer explicitement.
-- Les lectures propriétaire user_id/account_user_id restent inchangées.
begin;

drop policy if exists "Un utilisateur crée sa propre commande" on public.orders;
drop policy if exists "Un utilisateur crée les lignes de sa propre commande" on public.order_items;
drop policy if exists "Admin : marquer une commande comme expediee" on public.orders;
drop policy if exists "Admin : gérer le suivi logistique" on public.orders;

revoke insert, update, delete on table public.orders, public.order_items from public, anon, authenticated;
revoke update (
  shipped,
  fulfillment_status,
  tracking_carrier,
  tracking_number,
  tracking_url
) on table public.orders from public, anon, authenticated;
revoke truncate, references, trigger on table public.orders, public.order_items from public, anon, authenticated;

drop policy if exists "Admin : lecture de toutes les commandes" on public.orders;
create policy "Admin : lecture de toutes les commandes"
  on public.orders for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admin : lecture de toutes les lignes de commande" on public.order_items;
create policy "Admin : lecture de toutes les lignes de commande"
  on public.order_items for select to authenticated
  using ((select public.is_admin()));

commit;
