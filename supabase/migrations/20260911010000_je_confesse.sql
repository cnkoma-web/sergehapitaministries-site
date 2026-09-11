-- V2 Lot 4 (11/09) — "Je Confesse" : nouvelle catégorie de publication,
-- même modèle technique que Rosée Matinale (une entrée par jour, pas de
-- titre éditorial propre — le verset + sa référence en tiennent lieu).
-- Additive uniquement : ajoute une valeur à l'enum article_type existant
-- (jamais recréé) + une colonne nullable préparant le lien optionnel vers
-- un futur épisode Podcast (Lot 9, table pas encore créée : pas de
-- contrainte de clé étrangère pour l'instant, ajoutée quand la table
-- existera réellement).

alter type public.article_type add value if not exists 'jc';

alter table public.articles
  add column if not exists podcast_episode_id uuid null;

comment on column public.articles.podcast_episode_id is
  'Lien optionnel vers un épisode Podcast (Lot 9) — préparé mais pas encore contraint (FK) tant que la table podcast_episodes n''existe pas.';
