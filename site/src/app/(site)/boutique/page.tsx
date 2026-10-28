import type { Metadata } from "next";
import ConstructionPage, { constructionMetadata } from "@/components/layout/ConstructionPage";

const title = "Boutique | Serge Hapita Ministries";
const description = "La boutique de Serge Hapita Ministries sera prochainement disponible.";

export const metadata: Metadata = {
  ...constructionMetadata,
  title,
  description,
  alternates: { canonical: "/boutique" },
  openGraph: {
    type: "website",
    title,
    description,
    url: "/boutique",
    siteName: "Serge Hapita Ministries",
    locale: "fr_FR",
  },
};

export default function Page() {
  return <ConstructionPage section="Boutique" eyebrow="L’univers du ministère" />;
}
