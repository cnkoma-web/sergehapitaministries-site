-- Correctif (retour du 05/09) : la migration article_likes oubliait le
-- `grant select` sur la table, contrairement à toutes les autres tables du
-- projet (voir par exemple carts/cart_items) — sans lui, la policy RLS
-- "auth.uid() = user_id" n'est même jamais évaluée, Postgres refuse l'accès
-- avant, ce qui a fait échouer silencieusement hasUserLikedArticle() (aucune
-- erreur remontée côté app, juste "pas encore aimé" à tort après rechargement
-- de la page, vérifié en conditions réelles).
grant select on public.article_likes to authenticated;
