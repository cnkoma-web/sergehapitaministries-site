import BrandSplit from "@/components/layout/BrandSplit";
import Topbar from "@/components/layout/Topbar";
import Header from "@/components/layout/Header";
import CartSessionBootstrap from "@/components/cart/CartSessionBootstrap";

// Chrome commun aux pages publiques du site (header/ticker/nav — cahier §1.2).
// Volontairement séparé du layout racine pour que /admin ait sa propre interface
// (voir src/app/admin/(protected)/layout.tsx), sans hériter du header public.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CartSessionBootstrap />
      <BrandSplit />
      <Topbar />
      <Header />
      {children}
    </>
  );
}
