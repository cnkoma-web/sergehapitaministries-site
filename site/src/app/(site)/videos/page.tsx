import type { Metadata } from "next";
import ConstructionPage, { constructionMetadata } from "@/components/layout/ConstructionPage";
import { getPageContent } from "@/lib/content/pageContent";

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

export default async function Page() {
  const content = await getPageContent("videos");
  return <ConstructionPage section={content.title} eyebrow={content.eyebrow} status={content.status} messageLine1={content.message_1} messageLine2={content.message_2} blessing={content.blessing} backAction={content.back_action} />;
}

