import type { Metadata } from "next";
import LegalPageLayout from "@/components/layout/LegalPageLayout";

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
  },
  twitter: { card: "summary_large_image", title, description },
};

// V2 (retour du 11/09, Lot 8) — réhabillage visuel uniquement (voir
// LegalPageLayout.tsx). Texte inchangé : voir le commentaire équivalent
// dans mentions-legales/page.tsx sur les fichiers reference/
// contenus-juridiques-integres/*.md du 10/09.
export default function PolitiqueDeConfidentialitePage() {
  return (
    <LegalPageLayout
      title="Politique de confidentialité"
      lastUpdate="Dernière mise à jour : à préciser lors de la mise en ligne"
      currentHref="/politique-de-confidentialite"
    >
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
            <li>MailerLite, pour l&apos;envoi de la newsletter « ParoleDeViePourVous »</li>
            <li>Resend, pour l&apos;envoi des emails transactionnels (confirmation de commande, réponse à un message, etc.)</li>
            <li>
              Cloudflare Turnstile, pour vérifier automatiquement qu&apos;une demande ne provient pas d&apos;un robot
              malveillant
            </li>
          </ul>

          <h2>Protection contre les abus</h2>
          <p>
            Les formulaires, la création de compte et la connexion sont protégés par Cloudflare Turnstile. Lors de
            ces interactions, des données techniques telles que l&apos;adresse IP et des informations relatives au
            navigateur peuvent être traitées afin de détecter les soumissions automatisées et les tentatives
            frauduleuses. Ce traitement repose sur notre intérêt légitime à sécuriser le site, les comptes et les
            données reçues. Ces informations ne sont pas utilisées par Serge Hapita Ministries à des fins
            publicitaires.
          </p>

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
            <a href="/contact">formulaire de contact</a>
            .
          </p>

          <h2>Cookies</h2>
          <p>
            Ce site peut utiliser des cookies techniques nécessaires à son fonctionnement. Pour plus de détails,
            consultez notre{" "}
            <a href="/politique-de-cookies">politique de cookies</a>
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
            <a href="/contact">formulaire de contact</a>.
          </p>
    </LegalPageLayout>
  );
}
