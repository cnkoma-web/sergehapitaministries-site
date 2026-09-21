import type { Metadata } from "next";
import LegalPageLayout from "@/components/layout/LegalPageLayout";

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
  },
  twitter: { card: "summary_large_image", title, description },
};

// V2 (retour du 11/09, Lot 8) — réhabillage visuel uniquement (voir
// LegalPageLayout.tsx). Texte inchangé : voir le commentaire équivalent
// dans mentions-legales/page.tsx sur les fichiers reference/
// contenus-juridiques-integres/*.md du 10/09.
export default function PolitiqueDeCookiesPage() {
  return (
    <LegalPageLayout title="Politique de cookies" lastUpdate="Dernière mise à jour : à préciser lors de la mise en ligne" currentHref="/politique-de-cookies">
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
            <li>Détecter les soumissions automatisées et les abus grâce à Cloudflare Turnstile</li>
          </ul>
          <p>
            Ces cookies techniques ne nécessitent pas votre consentement préalable, conformément à la réglementation
            en vigueur, car ils sont indispensables à la fourniture du service que vous demandez.
          </p>

          <h2>Cookies de mesure d&apos;audience</h2>
          <p>
            Ce site utilise Google Analytics pour mesurer sa fréquentation (nombre de visites, pages consultées).
            Ces données sont anonymisées autant que possible et ne sont jamais utilisées à des fins publicitaires.
          </p>
          <p>
            Un bandeau de consentement vous est présenté lors de votre première visite, avant tout dépôt de ces
            cookies de mesure d&apos;audience : vous pouvez y accepter ou refuser leur utilisation, conformément à
            la réglementation en vigueur (RGPD/CNIL). Ils ne sont déposés que si vous avez donné votre accord.
          </p>

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
            <a href="/contact">formulaire de contact</a>.
          </p>
    </LegalPageLayout>
  );
}
