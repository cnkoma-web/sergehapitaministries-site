import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArticleBySlugAnyType,
  getRelatedArticles,
  getArticlesByIds,
  hasUserLikedArticle,
  ARTICLE_TYPE_LABEL,
  ARTICLE_TYPE_KICKER,
} from "@/lib/content/articles";
import { getCategoriesForArticle } from "@/lib/content/categories";
import { extractParagraphs, stripHtml, nbspBeforeClosingGuillemet } from "@/lib/richtext";
import { createClient } from "@/lib/supabase/server";
import { isRealUser } from "@/lib/supabase/realUser";
import ShareCartouche from "@/components/articles/ShareCartouche";
import LikeButton from "@/components/articles/LikeButton";
import ViewTracker from "@/components/articles/ViewTracker";
import RelatedArticlesSection from "@/components/articles/RelatedArticlesSection";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

const SITE_URL = "https://sergehapitaministries.org";

// Audit page article Que Dit la Bible (13/09) : toLocaleDateString("fr-FR",
// {weekday:"long",...}) rend le jour de la semaine en minuscule ("lundi"),
// alors que .entry-meta (maquette, prototype-html/publications/
// nouvel-article-ozsqc) l'écrit avec une majuscule ("Lundi 7 septembre
// 2026") — écart de contenu réel, corrigé ici localement (scopé à cette
// route, jamais un helper partagé qui toucherait d'autres pages non citées).
function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlugAnyType(slug);
  if (!article) return {};
  const title = `${article.title} | ${ARTICLE_TYPE_LABEL[article.type]}`;
  const description = article.excerpt || article.verse_text || article.title;
  // Plus d'image de couverture en override ici (retour du 05/09, cahier
  // §6.7) — une photo uploadée par Serge peut peser plusieurs Mo (mesuré :
  // jusqu'à 2,6 Mo sur un cas réel), largement au-dessus de ce que WhatsApp
  // accepte pour un aperçu de lien, d'où l'absence totale d'image au
  // partage. L'image générée par opengraph-image.tsx (toujours légère,
  // toujours à la bonne taille, avec la capsule de catégorie) devient la
  // seule source — Next.js la prend automatiquement via la convention de
  // fichier, sans qu'on ait besoin de la référencer ici.
  return {
    title,
    description,
    keywords: article.seo_keywords.length > 0 ? article.seo_keywords : undefined,
    alternates: { canonical: `/publications/${slug}` },
    openGraph: { type: "article", title, description, url: `/publications/${slug}`, siteName: "Serge Hapita Ministries", locale: "fr_FR" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlugAnyType(slug);
  if (!article) notFound();

  // Vue comptabilisée côté client, une fois par visiteur/jour (retour du
  // 06/09) — voir ViewTracker, rendu plus bas dans chaque gabarit. Plus
  // d'incrément inconditionnel ici : un Server Component ne peut de toute
  // façon pas écrire de cookie sortant pour retenir "déjà vu aujourd'hui".
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const categories = await getCategoriesForArticle(article.id);
  const manuallyRelated = article.related_article_ids.length > 0 ? await getArticlesByIds(article.related_article_ids) : [];
  const related = manuallyRelated.length > 0 ? manuallyRelated : await getRelatedArticles(article.type, article.id);
  const pageUrl = `${SITE_URL}/publications/${slug}`;
  // Chapeau réintégré dans le message de partage (retour du 05/09, 4e
  // passage — annule la règle "pas de chapeau" du passage précédent). Même
  // repli que partout ailleurs sur le site (PublicationFeedItem, etc.) : à
  // défaut de chapeau renseigné, le début du corps de l'article sert
  // d'accroche — au moins un article "La Vie Supérieure" publié n'a pas de
  // chapeau (excerpt: null), vérifié en base.
  const shareExcerpt = article.excerpt || (article.body ? stripHtml(article.body) : article.verse_text || undefined);
  // Le corps est du HTML (RichTextEditor) — on découpe par bloc <p> pour pouvoir
  // n'en révéler qu'une partie côté gating (La Vie Supérieure), sans jamais
  // couper au milieu d'une balise.
  const rawBody = article.body || "";
  const paragraphs = extractParagraphs(rawBody);

  if (article.type === "vs") {
    // Gating (cahier §3.5) : le corps complet n'est renvoyé au client que si
    // l'utilisateur est connecté — c'est un mur d'accès éditorial, pas un
    // chiffrement (voir commentaire de la policy RLS `articles`).
    const unlocked = isRealUser(user);
    // Bouton "J'aime" (retour du 05/09) — réservé aux comptes connectés ici,
    // même barrière que la lecture elle-même. Lu au chargement pour savoir
    // si CE compte a déjà aimé cet article, sans attendre un clic.
    const alreadyLiked = unlocked && user ? await hasUserLikedArticle(article.id, user.id) : false;
    return (
      // V2 (11/09, restructuré après audit structurel — voir le commentaire
      // détaillé au-dessus de .v2-article-page dans globals.css). Reproduit
      // fidèlement prototype-html/publications/nouvel-article-61cdg/
      // index.html § .entry-hero.life/.entry-kicker/.entry-chapeau/
      // .entry-meta/.entry-body/.like-row/.topic-list. Le mur d'accès
      // (gate-box/toc-teaser) reste sans équivalent prototype (jamais montré
      // dans un exemple d'article déjà publié) — voir le commentaire
      // détaillé dans globals.css.
      <div className="v2-article-page vs">
        <ViewTracker articleId={article.id} />
        <section className="article-header">
          <div className="content-col">
            {/* .entry-kicker (prototype) : badge seul sur La Vie Supérieure,
                pas de libellé de type à côté (contrairement à Que Dit la
                Bible, voir plus bas dans ce fichier). */}
            <div className="article-kicker">
              <div className="article-cat-badge">{ARTICLE_TYPE_LABEL.vs}</div>
            </div>
            <h1 className="article-title">{nbspBeforeClosingGuillemet(article.title)}</h1>
            {/* .entry-chapeau (prototype) : dans le héros, entre le titre et
                les métadonnées — jamais dans le corps (correction du 11/09,
                voir globals.css). */}
            {article.excerpt && <p className="article-chapeau">{nbspBeforeClosingGuillemet(article.excerpt)}</p>}
            {/* .entry-meta (prototype) : une seule ligne (auteur | temps de
                lecture | vues | date), pas deux lignes séparées (correction
                du 11/09). */}
            <div className="article-meta-line">
              {article.author_name && <span>{article.author_name}</span>}
              {article.reading_time_minutes && <span>{article.reading_time_minutes} min de lecture</span>}
              <span className="views">
                {article.view_count} vue{article.view_count > 1 ? "s" : ""}
              </span>
              <span>{new Date(article.article_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
          </div>
        </section>

        <section className="article-body">
          <div className="content-col">
            {/* overflowAnchor:"none" (retour du 05/09, point 5) — sans
                largeur/hauteur connues à l'avance, l'image ne réserve pas sa
                place : quand elle finit de charger après le premier rendu,
                le "scroll anchoring" du navigateur pouvait décaler la page
                vers le bas dès l'arrivée, cachant le titre. Ce div n'est
                plus utilisé comme ancre de compensation. */}
            {article.cover_url && (
              <div style={{ marginBottom: 28, borderRadius: 12, overflow: "hidden", overflowAnchor: "none" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={article.cover_url} alt={article.cover_alt || article.title} style={{ width: "100%", height: "auto", display: "block" }} />
              </div>
            )}
            {/* Classe "vs" (retour du 06/09) — colore citation/citation en
                exergue en bleu ici, violet sur Que Dit la Bible (voir
                globals.css et RichTextEditor). */}
            {(unlocked ? paragraphs : paragraphs.slice(0, 4)).map((html, i) => (
              <div key={i} className="body-html vs" dangerouslySetInnerHTML={{ __html: nbspBeforeClosingGuillemet(html) }} />
            ))}

            {/* Ordre exact de la maquette (.entry-body) : le corps se
                termine par J'aime puis les thématiques, jamais l'inverse —
                les deux réservés aux comptes connectés, même barrière que la
                lecture elle-même (retour du 05/09). */}
            {unlocked && (
              <LikeButton articleId={article.id} initialCount={article.like_count} mode="authenticated" initiallyLiked={alreadyLiked} />
            )}
            {unlocked && categories.length > 0 && (
              <div className="chip-row">
                {categories.map((c) => (
                  <span key={c.id} className="chip">
                    {c.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {!unlocked && (
          <>
            <div className="excerpt-fade" />
            <section className="section" style={{ paddingTop: 0 }}>
              <div className="content-col">
                <div className="gate-box">
                  <div className="lock">🔒</div>
                  <h3>La suite est réservée aux membres</h3>
                  <p>
                    L&apos;article complet est accessible gratuitement aux personnes disposant
                    d&apos;un compte sur ce site.
                  </p>
                  <div className="gate-actions">
                    <Link href="/compte?tab=signup" className="btn btn-primary">Créer un compte →</Link>
                    <Link href="/compte" className="btn btn-outline">Se connecter</Link>
                  </div>
                </div>

                {article.toc_keywords.length > 0 && (
                  <div className="toc-teaser">
                    <h4>Ce que la suite aborde</h4>
                    <ul className="toc-list">
                      {article.toc_keywords.map((k) => (
                        <li key={k}>{k}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Thématiques déplacées ici, juste avant le partage (retour
                    du 03/09) — même apparence/comportement, seulement la
                    position change. */}
                {categories.length > 0 && (
                  <div className="chip-row" style={{ marginBottom: 20 }}>
                    {categories.map((c) => (
                      <span key={c.id} className="chip">
                        {c.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* Zone de partage --purple pleine, toujours juste après
            .entry-body-section (prototype), verrouillé ou non. */}
        <section className="share-zone">
          <div className="content-col">
            <ShareCartouche title={article.title} url={pageUrl} category={article.type} articleDate={article.article_date} excerpt={shareExcerpt} />
          </div>
        </section>

        {/* "Prière & Déclaration" (retour du 07/09, champ étendu à La Vie
            Supérieure) — même grille .article-extras que Que Dit la Bible
            (prototype § .article-extras/.prayer-card), réservée aux comptes
            connectés comme le reste du corps. Jamais de "Aller plus loin"
            ici : further_verses reste propre à Que Dit la Bible (voir
            actions.ts). */}
        {unlocked && article.prayer && (
          <section className="article-extras">
            <div className="wrap article-extras-grid">
              <article className="extra-card prayer-card">
                <h2>Prière & Déclaration</h2>
                <p>{nbspBeforeClosingGuillemet(article.prayer)}</p>
              </article>
            </div>
          </section>
        )}

        <section className="section" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="content-col">
            <div className="back-cta">
              <Link href="/publications" className="btn btn-outline">← Toutes les publications</Link>
            </div>
          </div>
        </section>

        <Newsletter />
        <Footer variant="light" />
      </div>
    );
  }

  // Gabarit Que Dit la Bible — jamais verrouillé.
  return (
    // V2 (11/09, restructuré après audit structurel — voir le commentaire
    // détaillé au-dessus de .v2-article-page dans globals.css). Reproduit
    // fidèlement prototype-html/publications/nouvel-article-ozsqc/
    // index.html § .entry-hero/.entry-kicker/.entry-type/.entry-chapeau/
    // .entry-meta/.entry-body/.scripture-card/.article-blessing/
    // .topic-list/.like-row/.article-extras.
    <div className="v2-article-page qdlb">
      <ViewTracker articleId={article.id} />
      <section className="article-header">
        <div className="content-col">
          {/* .entry-kicker (prototype) : badge + libellé de type fixe,
              propre à toute la rubrique — jamais un champ par article,
              comme "Rosée Matinale"/"Je Confesse" ailleurs sur le site.
              Décision éditoriale validée (13/09) : "Enseignement"
              appartenait à tort à Que Dit la Bible (terme propre à La Vie
              Supérieure) — remplacé par "Examen des Écritures", tiré de
              ARTICLE_TYPE_KICKER (même mécanisme qu'ARTICLE_TYPE_LABEL,
              constante dérivée du type, jamais un texte en dur ici ni un
              champ par article). */}
          <div className="article-kicker">
            <div className="article-cat-badge">{ARTICLE_TYPE_LABEL.qdlb}</div>
            <span className="article-type">{ARTICLE_TYPE_KICKER.qdlb}</span>
          </div>
          <h1 className="article-title">{nbspBeforeClosingGuillemet(article.title)}</h1>
          {/* .entry-chapeau (prototype) : dans le héros, entre le titre et
              les métadonnées — jamais dans le corps (correction du 11/09,
              voir globals.css). */}
          {article.excerpt && <p className="article-chapeau">{nbspBeforeClosingGuillemet(article.excerpt)}</p>}
          {/* .entry-meta (prototype) : une seule ligne (auteur | temps de
              lecture | vues | date), pas deux lignes séparées (correction du
              11/09). */}
          <div className="article-meta-line">
            {article.author_name && <span>{article.author_name}</span>}
            {article.reading_time_minutes && <span>{article.reading_time_minutes} min de lecture</span>}
            <span className="views">
              {article.view_count} vue{article.view_count > 1 ? "s" : ""}
            </span>
            <span>{capitalizeFirst(new Date(article.article_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }))}</span>
          </div>
        </div>
      </section>

      <section className="article-body">
        <div className="content-col">
          {/* Renommé de "verse-box"/div+p à "scripture-card"/strong+blockquote
              (audit page article Que Dit la Bible, 13/09) : la maquette
              (§ .scripture-card) utilise ces deux éléments précis, jamais un
              div générique — vérifié qu'aucune autre page ne réutilise
              "verse-box" (classe propre à ce bloc, pas un composant
              partagé). Écarts de composition/style réels également corrigés
              (voir .v2-article-page .scripture-card, globals.css) : fond
              #f1edff (pas #eee8ff), padding 34px 38px (pas 30px 34px),
              margin 15px 0 44px (pas 0 0 44px), radius 0 14 14 0 (pas 0 12
              12 0). */}
          {article.verse_reference && article.verse_text && (
            <div className="scripture-card">
              <strong>{article.verse_reference}</strong>
              {/* Espace insécable avant le guillemet fermant (retour du
                  06/09, règle typographique française) — ces guillemets sont
                  ajoutés par ce gabarit, pas tapés par Serge. */}
              <blockquote>« {article.verse_text}{" "}»</blockquote>
            </div>
          )}

          {/* overflowAnchor:"none" — voir le commentaire équivalent plus haut
              (branche La Vie Supérieure). */}
          {article.cover_url && (
            <div style={{ marginBottom: 28, borderRadius: 12, overflow: "hidden", overflowAnchor: "none" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={article.cover_url} alt={article.cover_alt || article.title} style={{ width: "100%", height: "auto", display: "block" }} />
            </div>
          )}

          {paragraphs.length > 0 && <h2>Parlons-en</h2>}
          {/* Classe "qdlb" explicite (retour du 06/09) — violet par défaut
              de toute façon, mais nommée pour que le mécanisme reste clair
              si une autre rubrique s'ajoute un jour à ce gabarit. */}
          {paragraphs.map((html, i) => (
            <div key={i} className="body-html qdlb" dangerouslySetInnerHTML={{ __html: nbspBeforeClosingGuillemet(html) }} />
          ))}

          {/* Ordre exact de la maquette (.entry-body) : corps → bénédiction
              → thématiques → J'aime, dans cet ordre précis (corrigé le
              11/09 — Prière/"Aller plus loin" ne vivent plus ici, voir la
              grille .article-extras après le partage plus bas). */}
          <p className="blessing">Que Dieu te bénisse.</p>

          {/* Conteneur "article-topics" ajouté (audit 13/09) : la maquette
              (§ .article-topics) sépare les thématiques du reste du corps
              par un filet + une respiration propres (margin 26px 0 30px,
              padding-top 24px, border-top) — absent auparavant, .chip-row
              seul ne portait aucun séparateur. Voir .v2-article-page
              .article-topics dans globals.css. */}
          {categories.length > 0 && (
            <div className="article-topics">
              <div className="chip-row">
                {categories.map((c) => (
                  <span key={c.id} className="chip">
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Ordre validé (recontrôle validation humaine, 13/09) : Prière &
          Déclaration / Aller plus loin appartiennent à la publication et
          suivent immédiatement le corps complet — plus jamais séparés de
          lui par le partage. J'aime marque ensuite la réaction à
          l'ensemble de la publication (corps + Prière/Aller plus loin),
          suivi du partage puis des articles similaires. Habillage de
          .article-extras inchangé (grille 2 colonnes déjà validée),
          seule la position change. */}
      {(article.prayer || article.further_verses.length > 0) && (
        <section className="article-extras">
          <div className="wrap article-extras-grid">
            {article.prayer && (
              <article className="extra-card prayer-card">
                <h2>Prière & Déclaration</h2>
                <p>{nbspBeforeClosingGuillemet(article.prayer)}</p>
              </article>
            )}
            {article.further_verses.length > 0 && (
              <article className="extra-card further-reading">
                <h2>Aller plus loin</h2>
                {article.further_verses.map((v, i) => (
                  <p key={i}>
                    <strong>{v.reference}</strong>
                    <span>{v.text}</span>
                  </p>
                ))}
              </article>
            )}
          </div>
        </section>
      )}

      {/* J'aime déplacé ici (ordre validé, 13/09) : réagit désormais à
          l'ensemble de la publication (corps + Prière/Aller plus loin),
          pas seulement au corps seul — accessible à tout le monde, sans
          compte (Que Dit la Bible reste public). Même colonne/habillage
          que dans son ancien emplacement (.content-col, 790px). */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div className="content-col">
          <LikeButton articleId={article.id} initialCount={article.like_count} mode="public" />
        </div>
      </section>

      {/* Zone de partage --purple pleine, déplacée après J'aime (ordre
          validé, 13/09) — composant partagé ShareCartouche déjà certifié,
          design inchangé, seul l'emplacement change. */}
      <section className="share-zone">
        <div className="content-col">
          <ShareCartouche title={article.title} url={pageUrl} category={article.type} articleDate={article.article_date} excerpt={shareExcerpt} />
        </div>
      </section>

      {/* Extrait dans un composant partagé (retour du 07/09) — réutilisé tel
          quel par Rosée Matinale, corrige au passage le chapeau manquant
          quand une entrée Rosée Matinale est suggérée ici (liée
          manuellement) : elle n'a jamais de champ "excerpt", voir le repli
          dans RelatedArticlesSection. */}
      <RelatedArticlesSection articles={related} />

      <Newsletter />
      <Footer variant="light" />
    </div>
  );
}
