-- Médias podcast importés depuis le CMS.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('podcast-media','podcast-media',true,209715200,array['audio/mpeg','audio/mp4','audio/x-m4a','audio/wav','audio/ogg','video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set public=true, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;

create policy "Public : lecture des medias podcast" on storage.objects for select using (bucket_id='podcast-media');
create policy "Admin : ajout des medias podcast" on storage.objects for insert with check (bucket_id='podcast-media' and public.is_admin());
create policy "Admin : modification des medias podcast" on storage.objects for update using (bucket_id='podcast-media' and public.is_admin()) with check (bucket_id='podcast-media' and public.is_admin());
create policy "Admin : suppression des medias podcast" on storage.objects for delete using (bucket_id='podcast-media' and public.is_admin());
