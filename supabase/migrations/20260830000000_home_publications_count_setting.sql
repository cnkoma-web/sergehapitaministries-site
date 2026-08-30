-- Cahier §6.9 point 4 : le nombre d'articles affichés par catégorie dans le
-- teaser Publications de l'accueil était figé en dur (3) dans le code — on
-- l'expose comme un réglage `interface_texts` ordinaire, modifiable par Serge
-- depuis Admin > Textes globaux, sans toucher au code.
insert into public.interface_texts (key, value)
values ('home.publications_per_category', '3')
on conflict (key) do nothing;
