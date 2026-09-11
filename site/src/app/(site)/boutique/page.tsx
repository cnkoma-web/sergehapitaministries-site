import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getGoodies } from "@/lib/content/goodies";
import { formatPrice } from "@/lib/format";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

const title = "Boutique | Serge Hapita Ministries";
const description = "T-shirts et accessoires de Serge Hapita Ministries.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/boutique" },
  openGraph: { type: "website", title, description, url: "/boutique", siteName: "Serge Hapita Ministries", locale: "fr_FR" },
  twitter: { card: "summary_large_image", title, description },
};

// V2 (retour du 11/09, Lot 5) — réactivation, pas construction : reproduit
// prototype-html/boutique/index.html § .shop-hero/.shop-intro/.goodies-grid
// (commerce.css). getGoodies() existait déjà mais n'était pas encore
// branché sur cette page (retour du 05/09 — page volontairement remplacée
// par un message d'attente le temps que la Boutique existe réellement).
// La maquette montre 8 produits fictifs à titre d'exemple ("Bientôt
// disponible" pour la plupart) : ici, uniquement les vrais goodies actifs
// (getGoodies), jamais inventés.
export default async function BoutiquePage() {
  const goodies = await getGoodies();

  return (
    <div className="v2-commerce-page">
      <section className="v2-store-hero boutique">
        <div className="v2-commerce-wrap v2-store-hero-inner">
          <p className="v2-eyebrow light">
            <span /> L&apos;univers du ministère
          </p>
          <h1>Boutique</h1>
          <p>{description}</p>
        </div>
      </section>

      <section className="v2-commerce-wrap">
        <div className="v2-shop-intro">
          <h2>T-shirts et accessoires du ministère.</h2>
          <p>
            La Boutique est réservée aux articles dérivés. Les ouvrages de Serge restent disponibles dans la
            rubrique <Link href="/livres">Livres</Link>.
          </p>
        </div>

        {goodies.length === 0 ? (
          <p className="empty-state">Les premiers articles arrivent bientôt.</p>
        ) : (
          <div className="v2-goodies-grid">
            {goodies.map((goodie) => {
              const available = goodie.status === "available";
              return (
                <article className="v2-goodie-card" key={goodie.id}>
                  <div className="v2-goodie-visual">
                    {goodie.image_url ? (
                      <Image src={goodie.image_url} alt={goodie.title} fill style={{ objectFit: "cover" }} />
                    ) : (
                      <span>{goodie.title}</span>
                    )}
                  </div>
                  <div className="v2-goodie-body">
                    <h3>{goodie.title}</h3>
                    <p className="v2-goodie-status">
                      {available ? formatPrice(goodie.price_cents) : "Bientôt disponible"}
                    </p>
                    {available ? (
                      <Link href={`/boutique/${goodie.slug}`} className="v2-goodie-action">
                        Voir le produit
                      </Link>
                    ) : (
                      <Link href={`/boutique/${goodie.slug}`} className="v2-goodie-action">
                        Découvrir
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="v2-shop-opening" id="ouverture">
          <div>
            <strong>Ouverture prochaine</strong>
            <p>Les visuels, variantes et prix définitifs seront ajoutés au fur et à mesure.</p>
          </div>
          <a href="#newsletter">Être informé de l&apos;ouverture →</a>
        </div>
      </section>

      <Newsletter />
      <Footer variant="light" />
    </div>
  );
}
