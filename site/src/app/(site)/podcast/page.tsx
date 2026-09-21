import type { Metadata } from "next";
import ConstructionPage, { constructionMetadata } from "@/components/layout/ConstructionPage";

const title = "Podcast | Serge Hapita Ministries";
const description = "Les contenus audio de Serge Hapita Ministries seront prochainement disponibles.";

export const metadata: Metadata = {
  ...constructionMetadata,
  title,
  description,
  alternates: { canonical: "/podcast" },
  openGraph: {
    type: "website",
    title,
    description,
    url: "/podcast",
    siteName: "Serge Hapita Ministries",
    locale: "fr_FR",
  },
};

export default function Page() {
  return <ConstructionPage section="Podcast" eyebrow="Audio" />;
}
