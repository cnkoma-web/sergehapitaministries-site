-- V2 Lot 9 (11/09) — bucket dédié aux vignettes d'épisode Podcast (carré
-- 1:1, comme un cover art de podcast classique) — même principe exact que
-- book-covers/product-photos (20260824020000_storage_buckets.sql). Le
-- visuel de partage d'un épisode réutilise le bucket article-covers déjà
-- existant (16:9, même format que les autres visuels de partage du site).

insert into storage.buckets (id, name, public)
values ('podcast-covers', 'podcast-covers', true)
on conflict (id) do nothing;

create policy "Public : lecture des vignettes de podcast"
  on storage.objects for select
  using (bucket_id = 'podcast-covers');

create policy "Admin : upload de vignettes de podcast"
  on storage.objects for insert
  with check (bucket_id = 'podcast-covers' and public.is_admin());

create policy "Admin : modification de vignettes de podcast"
  on storage.objects for update
  using (bucket_id = 'podcast-covers' and public.is_admin());

create policy "Admin : suppression de vignettes de podcast"
  on storage.objects for delete
  using (bucket_id = 'podcast-covers' and public.is_admin());
