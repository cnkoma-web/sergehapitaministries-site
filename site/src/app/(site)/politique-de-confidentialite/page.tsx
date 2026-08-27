import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";

const title = "Politique de confidentialité | Serge Hapita Ministries";
const description = "Politique de confidentialité du site sergehapitaministries.org.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/politique-de-confidentialite" },
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    title,
    description,
    url: "/politique-de-confidentialite",
    siteName: "Serge Hapita Ministries",
    locale: "fr_FR",
    images: ["/assets/og/politique-de-confidentialite.jpg"],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/assets/og/politique-de-confidentialite.jpg"] },
};

export default function PolitiqueDeConfidentialitePage() {
  return (
    <>
      <section className="legal-hero">
        <div className="wrap">
          <h1>Politique de confidentialité</h1>
          <p>Dernière mise à jour : à préciser lors de la mise en ligne</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap legal-body">
          <h2>Quelles données collectons-nous ?</h2>
          <p>
            Selon les formulaires que vous utilisez sur ce site, nous pouvons collecter : votre nom, votre e-mail,
            votre numéro de téléphone, votre ville, ainsi que le contenu des messages que vous nous envoyez
            (contact, invitation, don, avis sur un livre ou un produit).
          </p>

          <h2>Pourquoi collectons-nous ces données ?</h2>
          <ul>
            <li>Répondre à vos messages et demandes (formulaire de contact, invitation, partenariat)</li>
            <li>Traiter vos commandes de livres ou de goodies</li>
            <li>Traiter vos dons</li>
            <li>Vous envoyer la newsletter « ParoleDeViePourVous », si vous y avez consenti</li>
            <li>Afficher votre avis sur un livre ou un produit, après validation</li>
          </ul>

          <h2>Base légale</h2>
          <p>
            Le traitement de vos données repose soit sur votre consentement explicite (newsletter, formulaires avec
            case à cocher), soit sur l&apos;exécution d&apos;une démarche que vous avez initiée (contact, commande,
            don).
          </p>

          <h2>Qui a accès à vos données ?</h2>
          <p>
            Vos données sont traitées par Serge Hapita Ministries. Certaines données peuvent être transmises à des
            prestataires techniques nécessaires au fonctionnement du site :
          </p>
          <ul>
            <li>Un prestataire de paiement (Stripe), pour le traitement des achats et des dons</li>
            <li>Un hébergeur, pour le fonctionnement du site</li>
          </ul>
          <div className="todo">
            À compléter : nom de l&apos;outil d&apos;envoi de newsletter le cas échéant (Mailchimp, Brevo...), et
            tout autre prestataire tiers ajouté ultérieurement.
          </div>

          <h2>Durée de conservation</h2>
          <p>
            Vos données sont conservées le temps nécessaire à la finalité pour laquelle elles ont été collectées, et
            au maximum 3 ans à compter de notre dernier contact, sauf obligation légale de conservation plus longue
            (notamment en matière comptable pour les achats et les dons).
          </p>

          <h2>Vos droits</h2>
          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits
            suivants sur vos données personnelles :
          </p>
          <ul>
            <li>Droit d&apos;accès à vos données</li>
            <li>Droit de rectification</li>
            <li>Droit à l&apos;effacement</li>
            <li>Droit d&apos;opposition au traitement</li>
            <li>Droit à la portabilité de vos données</li>
            <li>Droit de retirer votre consentement à tout moment (notamment pour la newsletter)</li>
          </ul>
          <p>
            Pour exercer l&apos;un de ces droits, vous pouvez nous contacter via notre{" "}
            <a href="/contact" style={{ color: "var(--purple)" }}>
              formulaire de contact
            </a>
            .
          </p>

          <h2>Cookies</h2>
          <p>
            Ce site peut utiliser des cookies techniques nécessaires à son fonctionnement. Pour plus de détails,
            consultez notre{" "}
            <a href="/politique-de-cookies" style={{ color: "var(--purple)" }}>
              politique de cookies
            </a>
            .
          </p>

          <h2>Sécurité</h2>
          <p>
            Nous mettons en œuvre les mesures techniques raisonnables pour protéger vos données contre tout accès
            non autorisé, perte ou divulgation.
          </p>

          <h2>Contact</h2>
          <p>
            Pour toute question relative à cette politique de confidentialité, vous pouvez nous contacter via notre{" "}
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
