-- SECTION 04 (fiche Livre) — donnée CMS manquante tranchée : ajout d'un
-- champ facultatif "Promesse du livre" sur public.books, pour alimenter le
-- bloc .book-promise (court texte éditorial affiché sous la byline, absent
-- du CMS jusqu'ici — aucun champ existant ne portait légitimement cette
-- donnée). Strictement additif : aucune colonne existante modifiée,
-- renommée ou supprimée.
alter table public.books add column promise text;

comment on column public.books.promise is
  'Promesse du livre : court texte éditorial facultatif affiché sous la byline sur la fiche produit (§ .book-promise de la maquette). Null/vide = bloc non rendu, jamais de repli sur description.';
