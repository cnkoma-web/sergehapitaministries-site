-- Stockage des images — deux buckets publics (lecture libre, comme des fichiers
-- statiques classiques), écriture réservée aux admins. Ratios (cahier §1.4) :
--   book-covers    : portrait 2:3  (couvertures de livres)
--   product-photos : carré 1:1     (photos produits boutique)
-- La validation du ratio elle-même se fait côté client avant l'upload (composant
-- ImageUploader) — ces policies ne garantissent que le contrôle d'accès, pas le ratio.

insert into storage.buckets (id, name, public)
values
  ('book-covers', 'book-covers', true),
  ('product-photos', 'product-photos', true)
on conflict (id) do nothing;

create policy "Public : lecture des couvertures de livres"
  on storage.objects for select
  using (bucket_id = 'book-covers');

create policy "Admin : upload de couvertures de livres"
  on storage.objects for insert
  with check (bucket_id = 'book-covers' and public.is_admin());

create policy "Admin : modification de couvertures de livres"
  on storage.objects for update
  using (bucket_id = 'book-covers' and public.is_admin());

create policy "Admin : suppression de couvertures de livres"
  on storage.objects for delete
  using (bucket_id = 'book-covers' and public.is_admin());

create policy "Public : lecture des photos produits"
  on storage.objects for select
  using (bucket_id = 'product-photos');

create policy "Admin : upload de photos produits"
  on storage.objects for insert
  with check (bucket_id = 'product-photos' and public.is_admin());

create policy "Admin : modification de photos produits"
  on storage.objects for update
  using (bucket_id = 'product-photos' and public.is_admin());

create policy "Admin : suppression de photos produits"
  on storage.objects for delete
  using (bucket_id = 'product-photos' and public.is_admin());
