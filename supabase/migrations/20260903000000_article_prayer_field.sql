-- Champ "Prière" optionnel (retour du 03/09) — texte unique, sur le même
-- principe technique que "Aller plus loin" (further_verses) : affiché en
-- section conditionnelle dans le corps de l'article, seulement si rempli.
alter table public.articles add column if not exists prayer text;
