-- Phase 4 — contenu éditorial dynamique.
-- Livres, goodies, articles (Que Dit la Bible / La Vie Supérieure / Rosée Matinale
-- unifiés sous un type), avis avec modération. Même schéma de sécurité que les
-- phases précédentes : RLS + GRANT explicites (ne pas oublier les GRANT, cf.
-- incident Phase 2), lecture publique du contenu actif/publié, écriture admin
-- via public.is_admin().

-- ============================================================
-- 1. Livres
-- ============================================================

create table public.books (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  author text not null default 'Serge Hapita',
  publisher text not null default 'amDG Éditions',
  badge text,
  price_cents integer,
  cover_url text,
  format text,
  pages integer,
  language text default 'Français',
  isbn text,
  description text,
  active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.books enable row level security;

create policy "Public : lecture des livres actifs" on public.books for select using (active = true);
create policy "Admin : lecture de tous les livres" on public.books for select using (public.is_admin());
create policy "Admin : création de livres" on public.books for insert with check (public.is_admin());
create policy "Admin : modification de livres" on public.books for update using (public.is_admin());
create policy "Admin : suppression de livres" on public.books for delete using (public.is_admin());

create trigger set_updated_at before update on public.books for each row execute function public.set_updated_at();

grant select on public.books to anon, authenticated;
grant insert, update, delete on public.books to authenticated;

-- Reprend le catalogue réel actuellement en dur dans livres.html (7 ouvrages).
-- cover_url pointe vers /covers/*.jpg (fichiers extraits du base64 d'origine,
-- servis depuis public/) pour les 2 livres qui ont déjà une vraie couverture ;
-- null = placeholder dégradé pour les autres, en attendant les vrais visuels
-- (cahier Partie 4 : couvertures manquantes pour 5 livres sur 7).
insert into public.books (slug, title, badge, price_cents, cover_url, position) values
  ('tu-deviens-ce-que-tu-connais', 'Tu Deviens Ce Que Tu Connais', 'Nouveauté', 1500, null, 0),
  ('manifester-ce-que-dieu-a-prevu', 'Manifester Ce Que Dieu A Prévu', 'Nouveauté', 1490, null, 1),
  ('ton-corps-t-ecoute', 'Ton Corps T''Écoute', null, 1390, '/covers/ton-corps-t-ecoute.jpg', 2),
  ('marcher-dans-la-foi-volet-2', 'Marcher Dans La Foi Qui Plaît À Dieu — Volet 2', null, 1490, '/covers/marcher-dans-la-foi-volet-2.jpg', 3),
  ('pourquoi-suis-je-ne-de-nouveau', 'Pourquoi Suis-Je Né De Nouveau', null, 790, null, 4),
  ('les-hauts-lieux-dans-le-culte-moderne', 'Les Hauts Lieux Dans Le Culte Moderne', null, 1090, null, 5),
  ('david-le-fugitif-du-royaume-vol-1', 'David — Le Fugitif Du Royaume, Volume 1', null, 1490, null, 6);

-- ============================================================
-- 2. Goodies (boutique)
-- ============================================================

create table public.goodies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  price_cents integer,
  image_url text,
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  material text,
  cut text,
  care text,
  fabrication text,
  shipping_delay text,
  status text not null default 'coming_soon' check (status in ('available', 'coming_soon')),
  active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.goodies enable row level security;

create policy "Public : lecture des goodies actifs" on public.goodies for select using (active = true);
create policy "Admin : lecture de tous les goodies" on public.goodies for select using (public.is_admin());
create policy "Admin : création de goodies" on public.goodies for insert with check (public.is_admin());
create policy "Admin : modification de goodies" on public.goodies for update using (public.is_admin());
create policy "Admin : suppression de goodies" on public.goodies for delete using (public.is_admin());

create trigger set_updated_at before update on public.goodies for each row execute function public.set_updated_at();

grant select on public.goodies to anon, authenticated;
grant insert, update, delete on public.goodies to authenticated;

-- Reprend les 8 goodies de boutique.html, tous "à venir" (aucun prix/visuel réel
-- fourni pour l'instant — cahier Partie 4 : catalogue Printful pas encore choisi).
insert into public.goodies (slug, title, status, position) values
  ('t-shirt-voix-prophetique', 'T-shirt — Voix Prophétique', 'coming_soon', 0),
  ('t-shirt-logo-ministries', 'T-shirt — Logo Ministries', 'coming_soon', 1),
  ('casquette-brodee', 'Casquette brodée', 'coming_soon', 2),
  ('mug-rosee-matinale', 'Mug — Rosée Matinale', 'coming_soon', 3),
  ('tote-bag', 'Tote bag', 'coming_soon', 4),
  ('carnet-de-notes', 'Carnet de notes', 'coming_soon', 5),
  ('echarpe', 'Écharpe', 'coming_soon', 6),
  ('coque-telephone', 'Coque téléphone', 'coming_soon', 7);

-- ============================================================
-- 3. Articles (Que Dit la Bible / La Vie Supérieure / Rosée Matinale)
-- ============================================================

create type public.article_type as enum ('qdlb', 'vs', 'rm');
create type public.article_access as enum ('free', 'paid');
create type public.article_status as enum ('draft', 'published');

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  type public.article_type not null,
  slug text not null unique,
  title text not null,
  article_date date not null default current_date,
  excerpt text,
  verse_reference text,
  verse_text text,
  body text,
  further_verses jsonb not null default '[]'::jsonb,
  toc_keywords text[] not null default '{}',
  access public.article_access not null default 'free',
  status public.article_status not null default 'draft',
  view_count integer not null default 0,
  reading_time_minutes integer,
  og_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.articles enable row level security;

-- Lecture publique des articles publiés : y compris pour La Vie Supérieure — le
-- verrouillage du corps de l'article aux non-connectés se fait côté application
-- (Server Component qui ne rend/renvoie pas `body` si le visiteur n'est pas
-- authentifié), pas en cachant la colonne côté base. C'est un mur d'accès de
-- type "freemium éditorial" (cahier §3.5 : compte gratuit suffit pour l'instant,
-- pas encore de paiement réel), pas un chiffrement — cohérent avec le besoin
-- actuel, à durcir si le contenu payant devient réellement sensible plus tard.
create policy "Public : lecture des articles publiés" on public.articles for select using (status = 'published');
create policy "Admin : lecture de tous les articles" on public.articles for select using (public.is_admin());
create policy "Admin : création d'articles" on public.articles for insert with check (public.is_admin());
create policy "Admin : modification d'articles" on public.articles for update using (public.is_admin());
create policy "Admin : suppression d'articles" on public.articles for delete using (public.is_admin());

create trigger set_updated_at before update on public.articles for each row execute function public.set_updated_at();

grant select on public.articles to anon, authenticated;
grant insert, update, delete on public.articles to authenticated;

-- Incrément atomique du compteur de vues (cahier §3.9, nouveau). Fonction dédiée
-- plutôt qu'un update direct exposé : un visiteur anonyme n'a que le droit
-- d'exécuter cet incrément précis, jamais d'écrire directement sur la ligne.
create function public.increment_article_views(article_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.articles set view_count = view_count + 1 where id = article_id and status = 'published';
$$;

grant execute on function public.increment_article_views(uuid) to anon, authenticated;

-- Reprend l'unique article La Vie Supérieure déjà rédigé, texte exact de
-- vie-superieure-entrepreneurs-chretiens.html (cahier Partie 4 : les autres
-- articles restent à écrire par Serge — rien inventé à la place). Pas de
-- "chapeau" distinct authored dans la maquette d'origine : excerpt reste vide,
-- le hub affichera un extrait tronqué du corps plutôt qu'un résumé inventé.
insert into public.articles (type, slug, title, article_date, access, status, toc_keywords, body) values
(
  'vs',
  'entrepreneurs-chretiens',
  'Des entrepreneurs qui sont chrétiens, ou des chrétiens qui entreprennent ?',
  '2026-08-01',
  'free',
  'published',
  array[
    'L''identité avant la fonction',
    'Un royaume qui n''emprunte pas ses critères au monde qu''il traverse',
    'Bâtir sans laisser le travail devenir un maître',
    'Des vies qui montrent ce déplacement',
    'Ce que la richesse n''est pas censée faire à une vie',
    'Le repos comme signe, pas comme récompense',
    'Le critère qui, finalement, demeure'
  ],
  'Il y a une question que je me suis longtemps posée sans oser vraiment la formuler, parce qu''elle me semblait presque déplacée dans un milieu où l''on encourage plutôt à avancer, à produire, à ne pas trop s''arrêter sur ce genre de nuance : est-ce que je suis un entrepreneur qui, accessoirement, se trouve être chrétien, ou est-ce que je suis un chrétien dont l''une des expressions possibles, aujourd''hui, consiste à entreprendre. Vue de loin, la différence peut paraître purement grammaticale, presque un jeu de mots entre un nom et un adjectif. Mais quand on prend le temps de la regarder de près, on s''aperçoit qu''elle ne décrit pas deux façons différentes de dire la même chose : elle décrit deux points de départ complètement différents, et donc, à terme, deux trajectoires qui peuvent se ressembler en apparence tout en étant fondées sur des choses très différentes.

J''ai passé de nombreuses années à bâtir des activités différentes, en autodidacte, en travaillant dur, porté par une conviction sincère que Dieu était avec moi, précisément parce que les choses avançaient, parce que je réussissais à faire vivre ma famille et à faire grandir ce que j''entreprenais. Un jour, après plus d''un an de travail intense loin de ma femme et de mon fils, dans un pays où je ne connaissais personne au départ, j''ai atteint un objectif que je poursuivais depuis longtemps : l''ouverture de la première implantation internationale de ce que j''avais construit. Et puis, quelques jours plus tard, sans qu''il se soit rien passé d''extérieur qui justifie ce changement, une tristesse profonde s''est installée.

C''est dans cet état, un soir, qu''un texte est revenu à mon esprit : le Psaume 127, et cette phrase que j''avais toujours lue comme un simple avertissement contre la paresse : si l''Éternel ne bâtit la maison, ceux qui la bâtissent travaillent en vain. Ce soir-là, pour la première fois, j''ai compris que ce verset pouvait décrire exactement ma situation, alors même que, sur le papier, tout indiquait une réussite.

Il faut prendre le temps de lire ce texte correctement, parce qu''on peut facilement lui faire dire l''inverse de ce qu''il affirme. Ce n''est pas un texte qui oppose le travail à l''absence de travail. C''est un texte qui oppose deux manières de travailler, et donc deux manières de bâtir une vie ou une entreprise : celle qui part de l''angoisse de devoir pourvoir soi-même à tout, et celle qui part de la confiance. C''est cette distinction, plus que tout le reste, qui a fini par transformer ma manière de comprendre ce que veut dire réussir en tant que chrétien.'
);

-- Reprend l'unique article Que Dit la Bible ? déjà rédigé, texte exact de
-- que-dit-la-bible-images-esprit.html.
insert into public.articles (type, slug, title, article_date, excerpt, verse_reference, verse_text, further_verses, access, status, body) values
(
  'qdlb',
  'tout-commence-par-les-images-de-votre-esprit',
  'Tout commence par les images de votre esprit',
  '2026-07-24',
  'Tout ce que vous voulez accomplir, vous devez d''abord le voir et en prendre possession intérieurement, par la foi.',
  '2 Corinthiens 4:18',
  'Ainsi nous regardons non pas à ce qui est visible, mais à ce qui est invisible, car les réalités visibles sont passagères et les invisibles sont éternelles.',
  '[
    {"reference": "Éphésiens 1:18-19", "text": "Je prie qu''''il illumine les yeux de votre cœur pour que vous sachiez quelle est l''''espérance qui s''''attache à son appel, quelle est la richesse de la gloire de son héritage qu''''il réserve aux saints, et quelle est l''''infinie grandeur de sa puissance, qui se manifeste avec efficacité par le pouvoir de sa force envers nous qui croyons."},
    {"reference": "Hébreux 11:1-3", "text": "Or la foi, c''''est la ferme assurance des choses qu''''on espère, la démonstration de celles qu''''on ne voit pas. C''''est à cause d''''elle que les anciens ont reçu un témoignage favorable. Par la foi, nous comprenons que l''''univers a été formé par la parole de Dieu, de sorte que le monde visible n''''a pas été fait à partir des choses visibles."}
  ]'::jsonb,
  'free',
  'published',
  'Tout ce que vous voulez accomplir dans la vie, vous devez d''abord le voir et en prendre possession intérieurement, c''est-à-dire dans votre esprit. La foi vous donne la capacité de regarder au-delà de ce que vos yeux physiques peuvent actuellement voir, afin de contempler intérieurement ce que Dieu a déclaré et préparé pour vous.

Par exemple, si vous voulez devenir un footballeur exceptionnel et un grand buteur, vous devez d''abord vous imaginer en possession du ballon, le contrôlant et dribblant pour vous frayer un chemin à travers la défense adverse. Vous devez vous voir approcher du but, déjouer le gardien et marquer vos buts. Vous devez le voir, en rêver et le repasser continuellement dans votre esprit avant d''entrer sur le terrain ; autrement, il vous sera difficile d''exceller.

De la même manière, si vous êtes avocat, vous devez vous voir vous adressant au tribunal, tandis que le juge, les autres avocats et toute la salle d''audience, captivés, vous regardent et vous écoutent présenter votre cause. Vous devez vous voir et vous entendre développer des arguments irréfutables avant même d''entrer dans la salle d''audience.

Tout commence par les images de votre esprit ! L''une des plus belles choses que vous puissiez faire pour vous-même en tant que chrétien est de construire continuellement dans votre esprit les bonnes images de ce que Dieu veut accomplir dans votre vie. Activez les yeux de votre foi afin de voir au-delà de votre horizon actuel et de vous contempler vivant ce qu''il y a de meilleur parmi tout ce que Dieu a préparé pour vous dans ce monde.

C''est ce que Dieu fit avec Abraham. Alors qu''il n''avait encore aucun enfant, Dieu le conduisit dehors et lui dit : « Regarde vers le ciel et compte les étoiles, si tu peux les compter. » Il lui affirma : « Telle sera ta descendance » (Genèse 15:5). Dieu plaça devant ses yeux une image correspondant à sa promesse. Chaque fois qu''Abraham regardait les étoiles, il pouvait voir au-delà de sa condition présente et contempler la descendance que Dieu lui avait annoncée.

Dieu ne nous a jamais créés pour souffrir ni pour mener une vie médiocre, dans laquelle nous parvenons à peine à joindre les deux bouts. Il nous a créés pour exceller et prospérer dans tous les domaines de notre vie. Cependant, tant que vous ne commencerez pas à vous voir ainsi — vivant dans l''abondance, dans une santé parfaite, dans la victoire et dans le succès — il vous sera difficile d''en faire l''expérience.

Ne laissez donc pas les difficultés présentes former en vous l''image de votre avenir. L''apôtre Paul nous enseigne que les choses visibles sont passagères. Elles sont susceptibles de changer. Fixez plutôt votre regard sur les réalités invisibles et éternelles que Dieu vous révèle dans sa Parole. Voyez-vous vivant dans ce domaine. Voyez-vous accomplissant le dessein de Dieu. Voyez-vous vivant le rêve de Dieu.'
);

-- Reprend l'unique entrée Rosée Matinale déjà rédigée. Le slug ne sert qu'à la
-- contrainte d'unicité en base — Rosée Matinale n'a pas de page individuelle par
-- entrée, elle vit entièrement sur /rosee-matinale (cahier §3.2).
insert into public.articles (type, slug, title, article_date, verse_text, access, status, body) values
(
  'rm',
  'rm-2026-08-19',
  'Rosée Matinale — 19 août 2026',
  '2026-08-19',
  'Ne laissez pas la tristesse de votre passé et la peur de votre avenir gâcher le bonheur de votre présent. Les vieilles habitudes n''ouvrent pas de nouvelles portes : pour avancer, il faut cesser de vivre tourné vers ce qui est derrière.',
  'free',
  'published',
  'Beaucoup de difficultés que les gens rencontrent sont liées à leur manière de penser, d''agir et de réagir face aux autres et aux situations. Parfois, surmonter une difficulté commence simplement par un changement de regard.

Ne laissez donc pas votre passé empoisonner votre avenir, ni vos échecs devenir votre identité. Un avenir extraordinaire ne nécessite pas un passé extraordinaire. Vous n''avez besoin de l''approbation de personne pour être heureux. Dieu ne vous a pas conduits jusqu''ici pour vous abandonner maintenant.'
);

-- ============================================================
-- 4. Avis (livres et goodies)
-- ============================================================

create type public.review_status as enum ('pending', 'approved', 'rejected');

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references public.books (id) on delete cascade,
  goodie_id uuid references public.goodies (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  author_name text,
  rating integer check (rating between 1 and 5),
  body text,
  status public.review_status not null default 'pending',
  created_at timestamptz not null default now(),
  constraint reviews_exactly_one_target check ((book_id is not null) <> (goodie_id is not null))
);

alter table public.reviews enable row level security;

create policy "Public : lecture des avis approuvés" on public.reviews for select using (status = 'approved');
create policy "Auteur : lecture de ses propres avis" on public.reviews for select using (auth.uid() = user_id);
create policy "Admin : lecture de tous les avis" on public.reviews for select using (public.is_admin());
create policy "Tout le monde peut soumettre un avis" on public.reviews for insert with check (status = 'pending');
create policy "Admin : modération des avis" on public.reviews for update using (public.is_admin());
create policy "Admin : suppression d'avis" on public.reviews for delete using (public.is_admin());

grant select on public.reviews to anon, authenticated;
-- "status" volontairement absent de cette liste : un visiteur ne peut jamais
-- s'auto-approuver, seule la valeur par défaut ('pending') s'applique.
grant insert (book_id, goodie_id, user_id, author_name, rating, body) on public.reviews to anon, authenticated;
grant update, delete on public.reviews to authenticated;

-- Vue pratique : note moyenne + nombre d'avis approuvés par livre/goodie,
-- utilisée par les cartes catalogue et les fiches produit.
create view public.review_summaries
with (security_invoker = true) as
select
  book_id,
  goodie_id,
  count(*) as review_count,
  round(avg(rating)::numeric, 1) as average_rating
from public.reviews
where status = 'approved' and rating is not null
group by book_id, goodie_id;

grant select on public.review_summaries to anon, authenticated;
