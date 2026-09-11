import type { Metadata } from "next";
import LegalPageLayout from "@/components/layout/LegalPageLayout";

const title = "Termes et conditions | Serge Hapita Ministries";
const description = "Termes et conditions d'utilisation du site sergehapitaministries.org.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/termes-et-conditions" },
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    title,
    description,
    url: "/termes-et-conditions",
    siteName: "Serge Hapita Ministries",
    locale: "fr_FR",
  },
  twitter: { card: "summary_large_image", title, description },
};

// V2 (retour du 11/09, Lot 8) — réhabillage visuel uniquement (voir
// LegalPageLayout.tsx). Texte inchangé : voir le commentaire équivalent
// dans mentions-legales/page.tsx sur les fichiers reference/
// contenus-juridiques-integres/*.md du 10/09.
export default function TermesEtConditionsPage() {
  return (
    <LegalPageLayout title="Termes et conditions" lastUpdate="Dernière mise à jour : à préciser lors de la mise en ligne" currentHref="/termes-et-conditions">
          <h2>Objet</h2>
          <p>
            Les présentes conditions régissent l&apos;utilisation du site sergehapitaministries.org ainsi que
            l&apos;achat de livres, goodies et la réalisation de dons via ce site. En utilisant ce site, vous
            acceptez les présentes conditions.
          </p>

          <h2>Contenu et publications</h2>
          <p>
            Les publications (Rosée Matinale, Que Dit la Bible ?, La Vie Supérieure), livres et enseignements
            diffusés sur ce site sont mis à disposition à titre d&apos;édification personnelle. Le contenu réservé
            aux membres (La Vie Supérieure) est accessible après création d&apos;un compte, dans les conditions
            décrites sur la page concernée.
          </p>

          <h2>Commandes et paiement</h2>
          <p>
            Les commandes de livres et de goodies sont traitées via notre prestataire de paiement sécurisé. Les
            prix sont indiqués en euros, toutes taxes comprises. Une confirmation de commande vous est adressée
            après validation du paiement.
          </p>
          <p>
            Les délais de livraison indicatifs sont de 24 à 48h en France métropolitaine, et de quelques jours pour
            les envois internationaux (zone A).
          </p>
          <h2>Retours et remboursement</h2>
          <p>
            Conformément au Code de la consommation, vous disposez d&apos;un délai de 14 jours à compter de la
            réception de votre commande pour exercer votre droit de rétractation, sans avoir à justifier de motifs.
            Les frais de retour sont à votre charge, sauf en cas de produit défectueux ou non conforme. Le
            remboursement est effectué dans un délai de 14 jours suivant la réception du produit retourné, par le
            même moyen de paiement que celui utilisé pour l&apos;achat.
          </p>

          <h2>Dons</h2>
          <p>
            Les dons effectués via ce site soutiennent l&apos;activité du ministère Serge Hapita Ministries. Ils
            peuvent être ponctuels, mensuels ou annuels, selon votre choix au moment du don. Un reçu est adressé
            après chaque don.
          </p>

          <h2>Compte utilisateur</h2>
          <p>
            La création d&apos;un compte peut être nécessaire pour accéder à certains contenus (La Vie Supérieure),
            publier un avis, ou faciliter vos commandes. Vous êtes responsable de la confidentialité de vos
            identifiants de connexion.
          </p>

          <h2>Avis et commentaires</h2>
          <p>
            Les avis publiés sur les fiches livres et produits sont soumis à modération avant publication. Nous
            nous réservons le droit de ne pas publier un avis contraire au respect d&apos;autrui ou sans rapport
            avec le produit concerné.
          </p>

          <h2>Propriété intellectuelle</h2>
          <p>
            Voir nos{" "}
            <a href="/mentions-legales">mentions légales</a> pour les dispositions relatives à la propriété
            intellectuelle des contenus du site.
          </p>

          <h2>Modification des conditions</h2>
          <p>
            Serge Hapita Ministries se réserve le droit de modifier les présentes conditions à tout moment. Les
            modifications prennent effet dès leur publication sur cette page.
          </p>

          <h2>Droit applicable</h2>
          <p>
            Les présentes conditions sont soumises au droit français. En cas de litige, et à défaut d&apos;accord
            amiable, les tribunaux français seront seuls compétents.
          </p>

          <h2>Contact</h2>
          <p>
            Pour toute question relative à ces conditions, vous pouvez nous contacter via notre{" "}
            <a href="/contact">formulaire de contact</a>.
          </p>
    </LegalPageLayout>
  );
}
