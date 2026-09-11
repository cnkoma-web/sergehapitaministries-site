-- V2 de l'interface (DOSSIER-INTERFACE-SERGE-HAPITA-MINISTRIES) — Lot 1,
-- socle commun. Ajoute au menu 3 entrées prévues par la maquette validée :
-- "Je Confesse" sous "Publications" (après "Rosée Matinale"), "La mission"
-- et "Podcast" sous "À propos" (respectivement après "De Serge" et après
-- "Vidéos", ordre exact du dossier : De Serge, La mission, Livres, Vidéos,
-- Podcast, Invitation, Partenariat).
--
-- Additif uniquement : aucune ligne existante supprimée. Les positions des
-- items déjà en place sont décalées par comparaison de libellé plutôt que
-- par valeur numérique fixe, pour ne pas dépendre des valeurs exactes déjà
-- en base (potentiellement modifiées depuis /admin/navigation).
--
-- "Je Confesse" et "Podcast" pointent déjà vers leurs futures routes
-- publiques (/publications/je-confesse-et-declare, /podcast) — ces pages
-- n'existent pas encore (lots 4 et 9), les liens resteront des 404 le temps
-- que ces lots soient construits ; sans impact sur le lot 1 lui-même, qui
-- ne porte que sur le socle commun (en-tête/pied de page).

do $$
declare
  a_propos_id nav_items.id%type;
  publications_id nav_items.id%type;
  de_serge_pos nav_items.position%type;
  videos_pos nav_items.position%type;
begin
  select id into a_propos_id from public.nav_items where label = 'À propos' and parent_id is null limit 1;
  select id into publications_id from public.nav_items where label = 'Publications' and parent_id is null limit 1;

  if a_propos_id is not null then
    select position into de_serge_pos from public.nav_items where parent_id = a_propos_id and label = 'De Serge' limit 1;
    if de_serge_pos is not null then
      update public.nav_items set position = position + 1 where parent_id = a_propos_id and position > de_serge_pos;
      insert into public.nav_items (parent_id, label, href, position) values (a_propos_id, 'La mission', '/mission', de_serge_pos + 1);
    end if;

    select position into videos_pos from public.nav_items where parent_id = a_propos_id and label = 'Vidéos' limit 1;
    if videos_pos is not null then
      update public.nav_items set position = position + 1 where parent_id = a_propos_id and position > videos_pos;
      insert into public.nav_items (parent_id, label, href, position) values (a_propos_id, 'Podcast', '/podcast', videos_pos + 1);
    end if;
  end if;

  if publications_id is not null then
    insert into public.nav_items (parent_id, label, href, position)
    select publications_id, 'Je Confesse', '/publications/je-confesse-et-declare', coalesce(max(position), 0) + 1
    from public.nav_items where parent_id = publications_id;
  end if;
end $$;
