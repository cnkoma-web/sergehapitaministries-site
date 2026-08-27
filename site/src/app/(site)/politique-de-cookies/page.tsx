import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";

const title = "Politique de cookies | Serge Hapita Ministries";
const description = "Politique de cookies du site sergehapitaministries.org.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/politique-de-cookies" },
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    title,
    description,
    url: "/politique-de-cookies",
    siteName: "Serge Hapita Ministries",
    locale: "fr_FR",
    images: ["/assets/og/politique-de-cookies.jpg"],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/assets/og/politique-de-cookies.jpg"] },
};

export default function PolitiqueDeCookiesPage() {
  return (
    <>
      <section className="legal-hero">
        <div className="wrap">
          <h1>Politique de cookies</h1>
          <p>Dernière mise à jour : à préciser lors de la mise en ligne</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap legal-body">
          <h2>Qu&apos;est-ce qu&apos;un cookie ?</h2>
          <p>
            Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, tablette, smartphone) lors
            de votre visite sur ce site. Il permet de reconnaître votre navigateur et de mémoriser certaines
            informations d&apos;une page à l&apos;autre, ou d&apos;une visite à l&apos;autre.
          </p>

          <h2>Les cookies que nous utilisons</h2>
          <p>Ce site utilise uniquement des cookies techniques, strictement nécessaires à son fonctionnement :</p>
          <ul>
            <li>Maintenir votre session lorsque vous êtes connecté à votre compte</li>
            <li>Mémoriser le contenu de votre panier d&apos;achat</li>
            <li>Assurer la sécurité de vos échanges avec le site</li>
          </ul>
          <p>
            Ces cookies techniques ne nécessitent pas votre consentement préalable, conformément à la réglementation
            en vigueur, car ils sont indispensables à la fourniture du service que vous demandez.
          </p>

          <h2>Cookies de mesure d&apos;audience et publicitaires</h2>
          <div className="todo">
            À compléter : si un outil de mesure d&apos;audience (Google Analytics, Matomo...) ou des cookies
            publicitaires/réseaux sociaux sont ajoutés au site, ils devront être listés ici avec leur finalité, leur
            durée de conservation, et un bandeau de consentement (bannière cookies) devra être mis en place avant
            leur dépôt.
          </div>

          <h2>Comment gérer les cookies ?</h2>
          <p>
            Vous pouvez à tout moment configurer votre navigateur pour accepter, refuser ou être averti avant le
            dépôt de cookies. La plupart des navigateurs (Chrome, Safari, Firefox, Edge) permettent de gérer ces
            préférences dans leurs paramètres de confidentialité.
          </p>
          <p>
            Attention : le refus de certains cookies techniques peut altérer le bon fonctionnement du site, par
            exemple le maintien de votre connexion ou de votre panier.
          </p>

          <h2>Durée de conservation</h2>
          <p>
            Les cookies techniques utilisés sur ce site sont conservés pour la durée de votre session, ou jusqu&apos;à
            13 mois maximum selon leur finalité.
          </p>

          <h2>Contact</h2>
          <p>
            Pour toute question relative à cette politique de cookies, vous pouvez nous contacter via notre{" "}
            <a href="/contact" style={{ color: "var(--purple)" }}>
              formulaire de contact
            </a>
            .
          </p>
        </div>
      </section>

      <Footer variant="dark" />
    </>
  );
}
