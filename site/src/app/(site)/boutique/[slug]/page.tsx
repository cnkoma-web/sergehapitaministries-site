import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGoodieBySlug } from "@/lib/content/goodies";
import { getReviewSummary } from "@/lib/content/reviews";
import { formatPrice } from "@/lib/format";
import { GoodieIcon } from "@/lib/content/goodieIcons";
import Stars from "@/components/reviews/Stars";
import ReviewSection from "@/components/reviews/ReviewSection";
import GoodiePurchasePanel from "@/components/shop/GoodiePurchasePanel";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const goodie = await getGoodieBySlug(slug);
  if (!goodie) return {};
  const title = `${goodie.title} | Serge Hapita Ministries`;
  const description = `${goodie.title} — boutique Serge Hapita Ministries.`;
  return {
    title,
    description,
    alternates: { canonical: `/boutique/${slug}` },
    openGraph: { type: "website", title, description, url: `/boutique/${slug}`, siteName: "Serge Hapita Ministries", locale: "fr_FR" },
  };
}

export default async function GoodieDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const goodie = await getGoodieBySlug(slug);
  if (!goodie) notFound();

  const summary = await getReviewSummary({ goodieId: goodie.id });
  const available = goodie.status === "available";

  return (
    <>
      <section className="product-section">
        <div className="wrap">
          <div className="book-nav">
            <span />
            <Link href="/boutique" className="book-nav-catalogue">Toute la boutique</Link>
            <span />
          </div>

          <div className="product-grid">
            <div className={goodie.image_url ? "product-cover" : "product-cover placeholder"} style={{ aspectRatio: "1/1" }}>
              {goodie.image_url ? (
                <Image src={goodie.image_url} alt={goodie.title} width={340} height={340} priority />
              ) : (
                <GoodieIcon slug={goodie.slug} />
              )}
            </div>

            <div>
              <div className="product-badge">{available ? "Disponible" : "Bientôt disponible"}</div>
              <h1 className="product-title">{goodie.title}</h1>
              <div className="product-author">
                {goodie.material || "Coton bio"} · {goodie.fabrication || "Fabrication à la demande"}
              </div>

              <div className="rating-row">
                <Stars rating={summary.average} />
                <span className="count">
                  {summary.count > 0 ? `${summary.average} · ${summary.count} avis` : "Aucun avis pour le moment"}
                </span>
              </div>

              <GoodiePurchasePanel
                goodieId={goodie.id}
                sizes={goodie.sizes}
                colors={goodie.colors}
                available={available}
                priceLabel={formatPrice(goodie.price_cents)}
              />

              <div className="specs-table">
                <div className="specs-row"><span>Matière</span><span>{goodie.material || "À renseigner"}</span></div>
                <div className="specs-row"><span>Coupe</span><span>{goodie.cut || "À renseigner"}</span></div>
                <div className="specs-row"><span>Tailles disponibles</span><span>{goodie.sizes.join(", ") || "À renseigner"}</span></div>
                <div className="specs-row"><span>Entretien</span><span>{goodie.care || "À renseigner"}</span></div>
                <div className="specs-row"><span>Fabrication</span><span>{goodie.fabrication || "À la demande"}</span></div>
                <div className="specs-row"><span>Délai d&apos;expédition</span><span>{goodie.shipping_delay || "À renseigner"}</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ReviewSection goodieId={goodie.id} />
      <Newsletter />
      <Footer variant="light" />
    </>
  );
}
