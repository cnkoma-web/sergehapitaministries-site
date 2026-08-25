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
    <>
      <section className="util-hero">
        <div className="wrap">
          <h1>Mon panier</h1>
          <p>Vérifiez votre commande avant de passer au paiement.</p>
        </div>
      </section>

      <section className="cart-section">
        <div className="wrap">
          {items.length === 0 ? (
            <div className="cart-empty">
              <p>Votre panier est vide.</p>
              <Link href="/livres" className="btn btn-primary">
                Découvrir les livres →
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

                <Link href="/livres" style={{ display: "block", textAlign: "center", fontSize: 13, color: "var(--ink-soft)", marginTop: 28 }}>
                  ← Continuer mes achats
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
