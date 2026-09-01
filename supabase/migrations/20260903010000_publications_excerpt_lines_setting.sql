-- Longueur de l'extrait sur les cartes d'aperçu (retour du 03/09) — nombre
-- de lignes affichées, réglable par Serge depuis Admin > Textes globaux,
-- pas une valeur fixée dans le code.
insert into public.interface_texts (key, value)
values ('publications.excerpt_lines', '2')
on conflict (key) do nothing;
