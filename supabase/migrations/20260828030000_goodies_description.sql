-- Cahier Partie 5 §6.4 : texte enrichi dans les descriptions, livres ET
-- produits boutique. Les goodies n'avaient encore aucun champ description.
alter table public.goodies add column description text;
