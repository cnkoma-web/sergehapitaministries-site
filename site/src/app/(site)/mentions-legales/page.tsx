import type { Metadata } from "next";
import LegalPageLayout from "@/components/layout/LegalPageLayout";
import { getPageContent } from "@/lib/content/pageContent";

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
  twitter: { card: "summary_large_image", title, description },
};

export default async function MentionsLegalesPage() {
  const content = await getPageContent("mentions-legales");
  return (
    <LegalPageLayout
      title={content.title}
      lastUpdate={content.last_update}
      currentHref="/mentions-legales"
      html={content.body}
    />
  );
}

