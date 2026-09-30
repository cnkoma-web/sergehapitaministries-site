import Link from "next/link";
import { getConfessionDuJour, getPublishedArticles, getRoseeDuJour, type Article } from "@/lib/content/articles";
import { stripHtml } from "@/lib/richtext";
import styles from "./HomeLatestPublications.module.css";

type Row = {
  article: Article | null;
  label: string;
  meta: string;
  href: string;
  tone: "dew" | "confession" | "bible" | "life";
  titleVisible?: boolean;
};

function formatDate(value?: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function preview(article: Article | null, tone: Row["tone"]) {
  if (!article) return "";
  // Sur Je Confesse, l’accueil affiche le titre de la confession uniquement.
  if (tone === "confession") return "";
  const source = article.excerpt || article.verse_text || article.body || "";
  return stripHtml(source).trim();
}
export default async function HomeLatestPublications() {
  const [rosee, confession, bibleArticles, lifeArticles] = await Promise.all([
    getRoseeDuJour(), getConfessionDuJour(), getPublishedArticles("qdlb"), getPublishedArticles("vs"),
  ]);
  const rows = ([
    { article: rosee, label: "Rosée Matinale", meta: "Pensée du jour", href: "/rosee-matinale", tone: "dew", titleVisible: true },
    { article: confession, label: "Je Confesse", meta: "Proclamation du jour", href: "/publications/je-confesse-et-declare", tone: "confession", titleVisible: true },
    { article: bibleArticles[0] ?? null, label: "Que dit la Bible ?", meta: "Examen du jour", href: bibleArticles[0] ? `/publications/${bibleArticles[0].slug}` : "/publications/que-dit-la-bible", tone: "bible", titleVisible: true },
    { article: lifeArticles[0] ?? null, label: "La Vie Supérieure", meta: "Enseignement du jour", href: lifeArticles[0] ? `/publications/${lifeArticles[0].slug}` : "/publications/la-vie-superieure", tone: "life", titleVisible: true },
  ] satisfies Row[]).sort((a,b)=>(b.article?.article_date ? new Date(b.article.article_date).getTime() : -Infinity) - (a.article?.article_date ? new Date(a.article.article_date).getTime() : -Infinity));
  return <section className={`${styles.latest} v2-wrap`} aria-label="Dernières publications">
    <div className={styles.heading}><h2>Dernières <em>publications</em></h2><Link href="/publications">Voir toutes les publications <span>→</span></Link></div>
    {rows.map(({article,label,meta,href,tone,titleVisible})=>{
      const text=preview(article, tone);
      return <article className={`${styles.row} ${styles[tone]}`} key={tone}>
        <div className={styles.identity}><div className={styles.label}>{label}</div><span className={styles.qualifier}>{meta}</span></div>
        <div className={styles.meta}>{article && <time dateTime={article.article_date}>{formatDate(article.article_date)}</time>}</div>
        <div className={styles.content}>{article ? <Link className={styles.contentLink} href={href}>
          {titleVisible && <h2>{article.title}</h2>}
          {text && <p className={tone === "confession" ? styles.confessionLead : undefined}>{text}</p>}
        </Link> : <p>Le prochain contenu sera publié ici.</p>}</div>
        <Link className={styles.arrow} href={href}>Lire la suite <span>→</span></Link>
      </article>;
    })}
  </section>;
}
