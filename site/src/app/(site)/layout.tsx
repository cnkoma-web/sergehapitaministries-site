import BrandSplit from "@/components/layout/BrandSplit";
import Topbar from "@/components/layout/Topbar";
import Header from "@/components/layout/Header";
import CartSessionBootstrap from "@/components/cart/CartSessionBootstrap";
import ScrollToTop from "@/components/layout/ScrollToTop";

// Chrome commun aux pages publiques du site (header/ticker/nav — cahier §1.2).
// Volontairement séparé du layout racine pour que /admin ait sa propre interface
// (voir src/app/admin/(protected)/layout.tsx), sans hériter du header public.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Retour en haut de page à chaque navigation interne (retour du
          07/09) — voir ScrollToTop.tsx pour la cause exacte : ce layout
          n'est jamais démonté d'une page publique à l'autre. */}
      <ScrollToTop />
      <CartSessionBootstrap />
      {/* V2 (retour du 11/09, Lot 1) — BrandSplit (liens partenaires) et
          Topbar (ticker) regroupés dans une seule bande sombre, comme
          prototype-html/index.html § .network-bar. Chaque composant garde
          ses propres données (getBrandSplitLinks/getTickerMessages),
          seul le regroupement visuel change. */}
      <div className="v2-network-bar">
        <div className="v2-wrap v2-network-inner">
          <BrandSplit />
          <Topbar />
        </div>
      </div>
      <Header />
      {children}
    </>
  );
}
