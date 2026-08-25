import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getGoodies } from "@/lib/content/goodies";
import { formatPrice } from "@/lib/format";
import { GoodieIcon } from "@/lib/content/goodieIcons";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

const title = "Boutique | Serge Hapita Ministries";
const description = "Goodies et accessoires du ministère Serge Hapita.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/boutique" },
  openGraph: { type: "website", title, description, url: "/boutique", siteName: "Serge Hapita Ministries", locale: "fr_FR", images: ["/assets/og/boutique.jpg"] },
  twitter: { card: "summary_large_image", title, description, images: ["/assets/og/boutique.jpg"] },
};

export default async function BoutiquePage() {
  const goodies = await getGoodies();

  return (
    <>
      <section className="util-hero">
        <div className="wrap">
          <h1>Boutique</h1>
          <p>T-shirts et accessoires du ministère.</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          {goodies.length === 0 ? (
            <p className="empty-state" style={{ textAlign: "center" }}>La boutique est en cours de préparation.</p>
          ) : (
            <div className="goodies-grid">
              {goodies.map((g) => (
                <div className="goodie-card" key={g.id}>
                  <div className="goodie-thumb">
                    {g.image_url ? (
                      <Image src={g.image_url} alt={g.title} width={140} height={140} />
                    ) : (
                      <GoodieIcon slug={g.slug} />
                    )}
                  </div>
                  <h3>{g.title}</h3>
                  {g.status === "coming_soon" ? (
                    <>
                      <div className="soon">Bientôt disponible</div>
                      <button className="btn-compact btn-compact-outline" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>
                        À venir
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="price">{formatPrice(g.price_cents)}</div>
                      <Link href={`/boutique/${g.slug}`} className="btn-compact btn-compact-primary">
                        Voir
                      </Link>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Newsletter />
      <Footer variant="light" />
    </>
  );
}
