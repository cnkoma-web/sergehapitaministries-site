import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";

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

export default function TermesEtConditionsPage() {
  return (
    <>
      <section className="legal-hero">
        <div className="wrap">
          <h1>Termes et conditions</h1>
          <p>Dernière mise à jour : à préciser lors de la mise en ligne</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="content-col legal-body">
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
          <div className="todo">
            À compléter avec Claude Code : modalités précises de retour et de remboursement, une fois le circuit
            logistique (livres) et Printful (goodies) mis en place.
          </div>

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
            <a href="/mentions-legales" style={{ color: "var(--purple)" }}>
              mentions légales
            </a>{" "}
            pour les dispositions relatives à la propriété intellectuelle des contenus du site.
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
