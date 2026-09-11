import type { Metadata } from "next";
import LegalPageLayout from "@/components/layout/LegalPageLayout";

const title = "Mentions légales | Serge Hapita Ministries";
const description = "Mentions légales du site sergehapitaministries.org.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/mentions-legales" },
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    title,
    description,
    url: "/mentions-legales",
    siteName: "Serge Hapita Ministries",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

// V2 (retour du 11/09, Lot 8) — réhabillage visuel uniquement (voir
// LegalPageLayout.tsx). Texte inchangé : les fichiers reference/
// contenus-juridiques-integres/mentions-legales-source.md (livrés le
// 10/09) se sont révélés être une capture du HTML rendu du site actuel,
// pas un nouveau texte juridique — vérifié et confirmé avec Serge le
// 11/09, jamais supposé silencieusement.
export default function MentionsLegalesPage() {
  return (
    <LegalPageLayout title="Mentions légales" lastUpdate="Dernière mise à jour : à préciser lors de la mise en ligne" currentHref="/mentions-legales">
          <h2>Éditeur du site</h2>
          <p>
            Le site sergehapitaministries.org est édité par Serge Hapita, dans le cadre de son
            ministère Serge Hapita Ministries, basé à Levallois-Perret, France.
          </p>
          <p>
            <strong>SIRET :</strong> 935 354 522 00010
          </p>
          <p>
            <strong>Directeur de la publication :</strong> Serge Hapita
          </p>

          <h2>Hébergement</h2>
          <p>
            Ce site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.
          </p>

          <h2>Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des contenus présents sur ce site (textes, enseignements,
            publications, visuels, logo, mise en page) est la propriété de Serge Hapita
            Ministries et d&apos;amDG Éditions, sauf mention contraire. Toute reproduction,
            représentation, modification ou exploitation, totale ou partielle, sans
            autorisation préalable écrite, est interdite et pourrait constituer une
            contrefaçon.
          </p>

          <h2>Liens hypertextes</h2>
          <p>
            Ce site peut contenir des liens vers d&apos;autres sites (ActesDesFilsDeDieu, amDG
            Éditions, réseaux sociaux, plateformes de paiement). Serge Hapita Ministries
            n&apos;exerce aucun contrôle sur ces sites tiers et décline toute responsabilité
            quant à leur contenu.
          </p>

          <h2>Limitation de responsabilité</h2>
          <p>
            Serge Hapita Ministries s&apos;efforce d&apos;assurer l&apos;exactitude et la mise
            à jour des informations diffusées sur ce site, mais ne peut garantir l&apos;absence
            d&apos;erreur ou d&apos;omission. L&apos;utilisation des informations du site se
            fait sous la seule responsabilité de l&apos;utilisateur.
          </p>

          <h2>Droit applicable</h2>
          <p>
            Les présentes mentions légales sont soumises au droit français. En cas de litige,
            et à défaut d&apos;accord amiable, les tribunaux français seront seuls compétents.
          </p>

          <h2>Contact</h2>
          <p>
            Pour toute question relative aux présentes mentions légales, vous pouvez nous
            contacter via notre <a href="/contact">formulaire de contact</a>.
          </p>
    </LegalPageLayout>
  );
}
