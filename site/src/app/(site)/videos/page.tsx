import type { Metadata } from "next";
import ConstructionPage, { constructionMetadata } from "@/components/layout/ConstructionPage";

const title = "Vidéos | Serge Hapita Ministries";
const description = "Les ressources vidéo de Serge Hapita Ministries seront prochainement disponibles.";

export const metadata: Metadata = {
  ...constructionMetadata,
  title,
  description,
  alternates: { canonical: "/videos" },
  openGraph: {
    type: "website",
    title,
    description,
    url: "/videos",
    siteName: "Serge Hapita Ministries",
    locale: "fr_FR",
  },
};

export default function Page() {
  return <ConstructionPage section="Vidéos" eyebrow="Médias" />;
}
