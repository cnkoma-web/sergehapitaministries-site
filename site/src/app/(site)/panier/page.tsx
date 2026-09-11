import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCartItems, cartSubtotalCents } from "@/lib/cart/cart";
import { formatPrice } from "@/lib/format";
import { GoodieIcon } from "@/lib/content/goodieIcons";
import CartItemRow from "@/components/cart/CartItemRow";
import CheckoutButton from "@/components/cart/CheckoutButton";

export const metadata: Metadata = {
  title: "Mon panier | Serge Hapita Ministries",
  robots: { index: false, follow: false },
};

export default async function PanierPage() {
  const items = await getCartItems();
  const subtotal = cartSubtotalCents(items);
  const hasMissingPrice = items.some((i) => (i.book?.price_cents ?? i.goodie?.price_cents ?? null) == null);

  return (
    // V2 (retour du 11/09, Lot 5) — reproduit prototype-html/panier/
    // index.html § .utility-hero/.cart-section/.cart-grid (commerce.css).
    // Réhabillage visuel uniquement : getCartItems, cartSubtotalCents,
    // CartItemRow, CheckoutButton inchangés.
    <div className="v2-panier-page">
      <section className="v2-utility-hero">
        <div className="v2-commerce-wrap">
          <p className="v2-eyebrow light">
            <span /> Votre sélection
          </p>
          <h1>Mon panier</h1>
          <p>Vérifiez votre commande avant de passer au paiement.</p>
        </div>
      </section>

      <section className="cart-section">
        <div className="v2-commerce-wrap">
          {items.length === 0 ? (
            <div className="cart-empty">
              <svg viewBox="0 0 24 24" aria-hidden="true" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--v2-violet-deep)" }}>
                <path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 8H6" />
                <circle cx="9.5" cy="19" r="1" />
                <circle cx="17" cy="19" r="1" />
              </svg>
              <h2>Votre panier est vide.</h2>
              <p>Découvrez les livres de Serge Hapita et ajoutez ceux qui vous accompagneront.</p>
              <Link href="/livres" className="v2-button v2-button-primary">
                Découvrir les livres <span>→</span>
              </Link>
            </div>
          ) : (
            <div className="cart-layout">
              <div>
                {items.map((item) => {
                  const title = item.book?.title ?? item.goodie?.title ?? "Produit";
                  const price = item.book?.price_cents ?? item.goodie?.price_cents ?? null;
                  const variantLabel = [item.variant_size, item.variant_color].filter(Boolean).join(" · ");
                  return (
                    <div className="cart-item" key={item.id}>
                      {item.book ? (
                        <div className="cart-thumb">
                          {item.book.cover_url && (
                            <Image src={item.book.cover_url} alt={title} width={80} height={120} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} />
                          )}
                        </div>
                      ) : (
                        <div className="cart-thumb goodie">
                          {item.goodie?.image_url ? (
                            <Image src={item.goodie.image_url} alt={title} width={80} height={80} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} />
                          ) : (
                            <GoodieIcon slug={item.goodie?.slug ?? ""} />
                          )}
                        </div>
                      )}
                      <div className="cart-item-info">
                        <div className="type">{item.book ? "Livre" : "Goodie"}</div>
                        <h4>
                          {title}
                          {variantLabel ? ` (${variantLabel})` : ""}
                        </h4>
                      </div>
                      <div className="cart-item-price">
                        <div className="price">{formatPrice(price)}</div>
                        <CartItemRow id={item.id} quantity={item.quantity} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="summary-card">
                <h3>Récapitulatif</h3>
                <div className="summary-row">
                  <span>Sous-total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Livraison</span>
                  <span>Calculée à l&apos;étape suivante</span>
                </div>
                <div className="promo-row">
                  <input type="text" placeholder="Code promo" disabled title="Codes promo bientôt disponibles" />
                  <button type="button" disabled title="Codes promo bientôt disponibles">
                    Appliquer
                  </button>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {hasMissingPrice && (
                  <div className="admin-error" style={{ marginTop: 16 }}>
                    Un article de votre panier n&apos;a pas encore de prix — retirez-le pour
                    pouvoir passer commande.
                  </div>
                )}

                <CheckoutButton disabled={hasMissingPrice} />

                <Link href="/livres" className="v2-continue-shopping">
                  ← Continuer mes achats
                </Link>
                <p className="v2-secure-note">
                  <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="4" y="10" width="16" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                  <span>Le paiement, l&apos;adresse de livraison et le mode d&apos;expédition sont recueillis sur la page sécurisée de Stripe.</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
