import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArticleBySlugAnyType,
  getRelatedArticles,
  getArticlesByIds,
  hasUserLikedArticle,
  ARTICLE_TYPE_LABEL,
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
      <>
        <ViewTracker articleId={article.id} />
        <section className="article-header">
          <div className="content-col">
            <div className="article-cat-badge">{ARTICLE_TYPE_LABEL.vs}</div>
            <h1 className="article-title">{nbspBeforeClosingGuillemet(article.title)}</h1>
            {/* Nouvelle structure (retour du 05/09, remplace la précédente) :
                ligne 1 auteur | temps de lecture | vues, ligne 2 date seule.
                Italique, même taille sur les deux lignes. */}
            <div className="article-meta-line">
              <div className="meta-line">
                {article.author_name && <span>{article.author_name}</span>}
                {article.reading_time_minutes && <span>{article.reading_time_minutes} min de lecture</span>}
                <span className="views">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {article.view_count} vue{article.view_count > 1 ? "s" : ""}
                </span>
              </div>
              <div className="meta-line">
                <span>{new Date(article.article_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="article-body">
          <div className="content-col">
            {/* Chapeau APRÈS l'image sur La Vie Supérieure (retour du 06/09,
                3e passage) — volontairement dans cet ordre, différent de Que
                Dit la Bible, pour distinguer l'expérience de lecture des
                deux rubriques. overflowAnchor:"none" (retour du 05/09,
                point 5) — sans largeur/hauteur connues à l'avance, l'image
                ne réserve pas sa place : quand elle finit de charger après
                le premier rendu, le "scroll anchoring" du navigateur (une
                fonctionnalité normalement utile, qui compense les décalages
                de mise en page pour garder le contenu déjà visible stable)
                pouvait décaler la page vers le bas dès l'arrivée, cachant le
                titre — exactement le symptôme rapporté. Ce div n'est plus
                utilisé comme ancre de compensation, sans changer sa
                taille/son apparence. */}
            {article.cover_url && (
              <div style={{ marginBottom: 28, borderRadius: 12, overflow: "hidden", overflowAnchor: "none" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={article.cover_url} alt={article.cover_alt || article.title} style={{ width: "100%", height: "auto", display: "block" }} />
              </div>
            )}
            {article.excerpt && <p className="article-lede">{nbspBeforeClosingGuillemet(article.excerpt)}</p>}
            {/* Classe "vs" (retour du 06/09) — colore citation/citation en
                exergue en bleu ici, violet sur Que Dit la Bible (voir
                globals.css et RichTextEditor). */}
            {(unlocked ? paragraphs : paragraphs.slice(0, 4)).map((html, i) => (
              <div key={i} className="body-html vs" dangerouslySetInnerHTML={{ __html: nbspBeforeClosingGuillemet(html) }} />
            ))}

            {/* Réservé aux comptes connectés, comme la lecture complète de
                l'article (retour du 05/09) — pas de bouton du tout tant que
                le mur d'accès n'est pas franchi. */}
            {unlocked && (
              <LikeButton articleId={article.id} initialCount={article.like_count} mode="authenticated" initiallyLiked={alreadyLiked} />
            )}

            {/* Prière & Déclaration (retour du 07/09) — champ étendu à La
                Vie Supérieure, jusqu'ici réservé à Que Dit la Bible (même
                champ, même style, voir plus bas dans ce fichier). Réservée
                aux comptes connectés comme le reste du corps. */}
            {unlocked && article.prayer && (
              <>
                <h2>Prière & Déclaration</h2>
                <div className="prayer-box">
                  <p>{nbspBeforeClosingGuillemet(article.prayer)}</p>
                </div>
              </>
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

            {/* Zone de partage --purple pleine (retour du 07/09) — voir le
                commentaire équivalent sur le gabarit Que Dit la Bible plus
                bas dans ce fichier. */}
            <section className="share-zone">
              <div className="content-col">
                <ShareCartouche title={article.title} url={pageUrl} category={article.type} excerpt={shareExcerpt} />
              </div>
            </section>

            {/* paddingBottom:0 (retour du 07/09, revue complète) — .back-cta
                porte désormais lui-même un espacement symétrique, plus besoin
                que cette section en ajoute côté haut ET bas. */}
            <section className="section" style={{ paddingTop: 0, paddingBottom: 0 }}>
              <div className="content-col">
                <div className="back-cta">
                  <Link href="/publications" className="btn btn-outline">← Toutes les publications</Link>
                </div>
              </div>
            </section>
          </>
        )}

        {unlocked && (
          <>
            {categories.length > 0 && (
              <section className="section" style={{ paddingTop: 0 }}>
                <div className="content-col">
                  <div className="chip-row">
                    {categories.map((c) => (
                      <span key={c.id} className="chip">
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            )}

            <section className="share-zone">
              <div className="content-col">
                <ShareCartouche title={article.title} url={pageUrl} category={article.type} excerpt={shareExcerpt} />
              </div>
            </section>

            <section className="section" style={{ paddingTop: 0, paddingBottom: 0 }}>
              <div className="content-col">
                <div className="back-cta">
                  <Link href="/publications" className="btn btn-outline">← Toutes les publications</Link>
                </div>
              </div>
            </section>
          </>
        )}

        <Newsletter />
        <Footer variant="light" />
      </>
    );
  }

  // Gabarit Que Dit la Bible — jamais verrouillé.
  return (
    <>
      <ViewTracker articleId={article.id} />
      <section className="article-header">
        <div className="content-col">
          <div className="article-cat-badge">{ARTICLE_TYPE_LABEL.qdlb}</div>
          <h1 className="article-title">{nbspBeforeClosingGuillemet(article.title)}</h1>
          {/* Nouvelle structure (retour du 05/09, remplace la précédente) :
              ligne 1 auteur | temps de lecture | vues, ligne 2 date seule.
              Italique, même taille sur les deux lignes. */}
          <div className="article-meta-line">
            <div className="meta-line">
              {article.author_name && <span>{article.author_name}</span>}
              {article.reading_time_minutes && <span>{article.reading_time_minutes} min de lecture</span>}
              <span className="views">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {article.view_count} vue{article.view_count > 1 ? "s" : ""}
              </span>
            </div>
            <div className="meta-line">
              <span>{new Date(article.article_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="article-body">
        <div className="content-col">
          {/* Chapeau avant le verset d'ouverture (retour du 03/09, ordre
              exact demandé pour Que Dit la Bible). */}
          {article.excerpt && <p className="article-lede">{nbspBeforeClosingGuillemet(article.excerpt)}</p>}

          {article.verse_reference && article.verse_text && (
            <div className="verse-box">
              <div className="ref">{article.verse_reference}</div>
              {/* Espace insécable avant le guillemet fermant (retour du
                  06/09, règle typographique française) — ces guillemets sont
                  ajoutés par ce gabarit, pas tapés par Serge. */}
              <p>« {article.verse_text}{" "}»</p>
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

          {/* Bouton "J'aime" (retour du 05/09) — juste après le corps du
              texte, avant "Aller plus loin"/Prière/thématiques. Accessible à
              tout le monde, sans compte (Que Dit la Bible reste public). */}
          <LikeButton articleId={article.id} initialCount={article.like_count} mode="public" />

          {/* Positionnée avant "Aller plus loin" (retour du 03/09). Identité
              visuelle distincte (retour du 05/09) : italique + fond gris
              clair, même principe que le trait vertical déjà utilisé pour
              "Aller plus loin" (.further-verse) — affichage public, pas
              seulement le champ d'édition dans l'admin. */}
          {article.prayer && (
            <>
              <h2>Prière & Déclaration</h2>
              <div className="prayer-box">
                <p>{nbspBeforeClosingGuillemet(article.prayer)}</p>
              </div>
            </>
          )}

          {article.further_verses.length > 0 && (
            <>
              <h2>Aller plus loin</h2>
              {article.further_verses.map((v, i) => (
                <div className="further-verse" key={i}>
                  <div className="ref">{v.reference}</div>
                  {/* Espace insécable avant le guillemet fermant (retour du
                      06/09) — même raison que le verse-box plus haut. */}
                  <p>« {v.text}{" "}»</p>
                </div>
              ))}
            </>
          )}

          {/* Ordre corrigé (retour du 04/09) : thématiques avant la
              bénédiction, avec un vrai espacement entre les deux (pas
              seulement le trait de séparation de .blessing). */}
          {categories.length > 0 && (
            <div className="chip-row" style={{ marginBottom: 40 }}>
              {categories.map((c) => (
                <span key={c.id} className="chip">
                  {c.name}
                </span>
              ))}
            </div>
          )}

          <div className="blessing">Que Dieu te bénisse abondamment</div>
        </div>
      </section>

      {/* Zone de partage --purple pleine (retour du 07/09) — avant, un
          simple trait fin séparait ce bloc du texte au-dessus ; la démarcation
          est maintenant une vraie zone de couleur, comme "Autres articles
          similaires" juste après (--lavender pâle). "← Toutes les
          publications" reste en dehors : ce n'est pas une invitation au
          partage, juste un lien de retour. */}
      <section className="share-zone">
        <div className="content-col">
          <ShareCartouche title={article.title} url={pageUrl} category={article.type} excerpt={shareExcerpt} />
        </div>
      </section>

      {/* Revue complète des zones de partage (retour du 07/09, 2e passage) :
          le trait qui séparait autrefois .back-cta du bloc au-dessus est
          retiré (redondant, la bande --purple juste au-dessus démarque déjà
          nettement) et son espacement est désormais symétrique (voir
          .back-cta) pour que le bouton soit centré dans sa propre zone
          blanche, entre la bande de partage et "Autres articles
          similaires" juste en dessous. */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div className="content-col">
          <div className="back-cta">
            <Link href="/publications" className="btn btn-outline">← Toutes les publications</Link>
          </div>
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
    </>
  );
}
