-- Correctif (retour du 11/09, relecture globale avant bascule) : les
-- migrations podcast_episodes et events (Lots 9 et 11) oubliaient le
-- `grant select/insert/update/delete`, contrairement à toutes les autres
-- tables du projet (voir par exemple articles/books/goodies dans
-- 20260825000000_phase4_catalog_articles_reviews.sql) — même bug déjà
-- rencontré une fois sur article_likes (20260905010000). Sans lui, les
-- policies RLS ne sont même jamais évaluées, Postgres refuse l'accès avant :
-- confirmé en direct via l'API REST publique, "permission denied for table
-- podcast_episodes"/"events" malgré des policies RLS correctes.

grant select on public.podcast_episodes to anon, authenticated;
grant insert, update, delete on public.podcast_episodes to authenticated;

grant select on public.events to anon, authenticated;
grant insert, update, delete on public.events to authenticated;
