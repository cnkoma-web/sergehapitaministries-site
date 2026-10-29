import type { Metadata } from "next";
import ConstructionPage, { constructionMetadata } from "@/components/layout/ConstructionPage";
import { getPageContent } from "@/lib/content/pageContent";

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

export default async function Page() {
  const content = await getPageContent("boutique");
  return <ConstructionPage section={content.title} eyebrow={content.eyebrow} status={content.status} messageLine1={content.message_1} messageLine2={content.message_2} blessing={content.blessing} backAction={content.back_action} />;
}

