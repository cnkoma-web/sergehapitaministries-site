-- Retour du 30/08 : le survol du bouton "Publications" fait bien apparaître
-- le menu déroulant, mais un clic dessus ne menait nulle part (le libellé du
-- menu n'a jamais eu de href propre). Corrigé côté code (un menu déroulant
-- peut désormais aussi être cliquable sur son libellé) — il reste à donner
-- une destination à la ligne "Publications" elle-même. Ne touche que la
-- ligne de premier niveau (parent_id is null) qui n'a encore aucun href.
update public.nav_items
set href = '/publications'
where label = 'Publications' and parent_id is null and href is null;
