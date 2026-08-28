-- Refonte admin Publications (cahier Partie 5, §6.1/6.2) : champs enrichis
-- (couverture, auteur, articles similaires, mots-clés SEO) + passage du corps
-- de l'article en HTML (texte enrichi) au lieu de texte brut séparé par des
-- lignes vides.

alter table public.articles add column cover_url text;
alter table public.articles add column cover_alt text;
alter table public.articles add column author_name text;
alter table public.articles add column related_article_ids uuid[] not null default '{}';
alter table public.articles add column seo_keywords text[] not null default '{}';

-- Bucket de stockage pour les images de couverture d'articles (16:9, cf. maquette
-- admin-modele-editeur-article.html) — même principe que book-covers/product-photos.
insert into storage.buckets (id, name, public)
values ('article-covers', 'article-covers', true)
on conflict (id) do nothing;

create policy "Public : lecture des couvertures d'articles"
  on storage.objects for select
  using (bucket_id = 'article-covers');
create policy "Admin : upload de couvertures d'articles"
  on storage.objects for insert
  with check (bucket_id = 'article-covers' and public.is_admin());
create policy "Admin : modification de couvertures d'articles"
  on storage.objects for update
  using (bucket_id = 'article-covers' and public.is_admin());
create policy "Admin : suppression de couvertures d'articles"
  on storage.objects for delete
  using (bucket_id = 'article-covers' and public.is_admin());

-- Conversion des 3 articles réels existants (texte brut, paragraphes séparés
-- par une ligne vide) vers l'équivalent HTML (<p>...</p>) — le rendu public
-- passe désormais par dangerouslySetInnerHTML plutôt que par un split("\n\n").
-- Fonction utilitaire temporaire, supprimée en fin de script.
create or replace function pg_temp.paragraphs_to_html(raw text) returns text as $$
  select string_agg('<p>' || replace(trim(p), E'\n', '<br>') || '</p>', '')
  from unnest(string_to_array(raw, E'\n\n')) as p
  where trim(p) <> '';
$$ language sql immutable;

update public.articles set body = pg_temp.paragraphs_to_html(body) where body is not null and body not like '<%';
