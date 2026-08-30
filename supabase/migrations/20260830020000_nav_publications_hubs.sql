-- Retour du 30/08 : les liens "Que Dit la Bible ?" / "La Vie Supérieure" du
-- menu déroulant Publications pointaient vers des ancres (#que-dit-la-bible,
-- #vie-superieure) sur le hub général — ces ancres n'existent plus depuis le
-- passage au flux unifié, l'accès était donc cassé. Chaque catégorie a
-- maintenant son propre hub dédié (/publications/que-dit-la-bible,
-- /publications/la-vie-superieure) ; ce correctif ne touche que les lignes
-- qui portent encore l'ancienne valeur exacte — si Serge a déjà modifié ces
-- liens depuis l'admin, ce correctif ne les écrase pas.
update public.nav_items
set href = '/publications/que-dit-la-bible'
where href = '/publications#que-dit-la-bible';

update public.nav_items
set href = '/publications/la-vie-superieure'
where href = '/publications#vie-superieure';
