import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArticleBySlugAnyType,
  getRelatedArticles,
  getArticlesByIds,
  incrementViewCount,
  ARTICLE_TYPE_LABEL,
} from "@/lib/content/articles";
import { getCategoriesForArticle } from "@/lib/content/categories";
import { extractParagraphs } from "@/lib/richtext";
import { createClient } from "@/lib/supabase/server";
import { isRealUser } from "@/lib/supabase/realUser";
import ShareCartouche from "@/components/articles/ShareCartouche";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

const SITE_URL = "https://sergehapitaministries.org";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlugAnyType(slug);
  if (!article) return {};
  const title = `${article.title} | ${ARTICLE_TYPE_LABEL[article.type]}`;
  const description = article.excerpt || article.verse_text || article.title;
  const images = article.cover_url ? [{ url: article.cover_url, alt: article.cover_alt ?? title }] : undefined;
  return {
    title,
    description,
    keywords: article.seo_keywords.length > 0 ? article.seo_keywords : undefined,
    alternates: { canonical: `/publications/${slug}` },
    openGraph: { type: "article", title, description, url: `/publications/${slug}`, siteName: "Serge Hapita Ministries", locale: "fr_FR", images },
    twitter: { card: "summary_large_image", title, description, images: images?.map((i) => i.url) },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlugAnyType(slug);
  if (!article) notFound();

  // Incrémenté à chaque consultation réelle de la page (cahier §3.9). Ne bloque
  // pas le rendu si ça échoue (compteur non critique).
  incrementViewCount(article.id).catch(() => {});

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const categories = await getCategoriesForArticle(article.id);
  const manuallyRelated = article.related_article_ids.length > 0 ? await getArticlesByIds(article.related_article_ids) : [];
  const related = manuallyRelated.length > 0 ? manuallyRelated : await getRelatedArticles(article.type, article.id);
  const pageUrl = `${SITE_URL}/publications/${slug}`;
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
    return (
      <>
        <section className="article-header">
          <div className="content-col">
            <div className="article-cat-badge">{ARTICLE_TYPE_LABEL.vs}</div>
            <h1 className="article-title">{article.title}</h1>
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
            {/* Chapeau dans le corps de l'article (retour du 03/09) — en
                haut, avant le premier paragraphe (pas d'ordre imposé pour
                La Vie Supérieure au-delà de ça). */}
            {article.excerpt && <p className="article-lede">{article.excerpt}</p>}
            {article.cover_url && (
              <div style={{ marginBottom: 28, borderRadius: 12, overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={article.cover_url} alt={article.cover_alt || article.title} style={{ width: "100%", height: "auto", display: "block" }} />
              </div>
            )}
            {(unlocked ? paragraphs : paragraphs.slice(0, 4)).map((html, i) => (
              <div key={i} className="body-html" dangerouslySetInnerHTML={{ __html: html }} />
            ))}
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

                <ShareCartouche title={article.title} url={pageUrl} />
                <div className="back-cta">
                  <Link href="/publications" className="btn btn-outline">← Toutes les publications</Link>
                </div>
              </div>
            </section>
          </>
        )}

        {unlocked && (
          <section className="section" style={{ paddingTop: 0 }}>
            <div className="content-col">
              {categories.length > 0 && (
                <div className="chip-row" style={{ marginBottom: 20 }}>
                  {categories.map((c) => (
                    <span key={c.id} className="chip">
                      {c.name}
                    </span>
                  ))}
                </div>
              )}
              <ShareCartouche title={article.title} url={pageUrl} />
              <div className="back-cta">
                <Link href="/publications" className="btn btn-outline">← Toutes les publications</Link>
              </div>
            </div>
          </section>
        )}

        <Newsletter />
        <Footer variant="light" />
      </>
    );
  }

  // Gabarit Que Dit la Bible — jamais verrouillé.
  return (
    <>
      <section className="article-header">
        <div className="content-col">
          <div className="article-cat-badge">{ARTICLE_TYPE_LABEL.qdlb}</div>
          <h1 className="article-title">{article.title}</h1>
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
          {article.excerpt && <p className="article-lede">{article.excerpt}</p>}

          {article.verse_reference && article.verse_text && (
            <div className="verse-box">
              <div className="ref">{article.verse_reference}</div>
              <p>« {article.verse_text} »</p>
            </div>
          )}

          {article.cover_url && (
            <div style={{ marginBottom: 28, borderRadius: 12, overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={article.cover_url} alt={article.cover_alt || article.title} style={{ width: "100%", height: "auto", display: "block" }} />
            </div>
          )}

          {paragraphs.length > 0 && <h2>Parlons-en</h2>}
          {paragraphs.map((html, i) => (
            <div key={i} className="body-html" dangerouslySetInnerHTML={{ __html: html }} />
          ))}

          {/* Positionnée avant "Aller plus loin" (retour du 03/09). Identité
              visuelle distincte (retour du 05/09) : italique + fond gris
              clair, même principe que le trait vertical déjà utilisé pour
              "Aller plus loin" (.further-verse) — affichage public, pas
              seulement le champ d'édition dans l'admin. */}
          {article.prayer && (
            <>
              <h2>Prière</h2>
              <div className="prayer-box">
                <p>{article.prayer}</p>
              </div>
            </>
          )}

          {article.further_verses.length > 0 && (
            <>
              <h2>Aller plus loin</h2>
              {article.further_verses.map((v, i) => (
                <div className="further-verse" key={i}>
                  <div className="ref">{v.reference}</div>
                  <p>« {v.text} »</p>
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

          <ShareCartouche title={article.title} url={pageUrl} />
          <div className="back-cta">
            <Link href="/publications" className="btn btn-outline">← Toutes les publications</Link>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="related-articles">
          <div className="wrap">
            {/* Intitulé neutre, sans nom de catégorie entre guillemets
                (retour du 05/09). */}
            <h2>Autres articles similaires</h2>
            <div className="related-grid">
              {related.map((a) => (
                <div className="related-card" key={a.id}>
                  <div className="verse">
                    {/* Format complet en toutes lettres, identique au reste
                        des articles (retour du 05/09) — plus le format
                        abrégé "19 août". */}
                    {new Date(a.article_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </div>
                  <h3>{a.title}</h3>
                  {/* Chapeau ajouté sous le titre (retour du 05/09). */}
                  {a.excerpt && <p className="related-card-excerpt">{a.excerpt}</p>}
                  <Link href={`/publications/${a.slug}`}>Lire l&apos;article →</Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Newsletter />
      <Footer variant="light" />
    </>
  );
}
