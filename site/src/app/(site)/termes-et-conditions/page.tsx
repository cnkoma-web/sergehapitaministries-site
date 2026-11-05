import type { Metadata } from "next";
import LegalPageLayout from "@/components/layout/LegalPageLayout";
import { getPageContent } from "@/lib/content/pageContent";

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

export default async function TermesEtConditionsPage() {
  const content = await getPageContent("termes-et-conditions");
  return (
    <LegalPageLayout
      title={content.title}
      lastUpdate={content.last_update}
      currentHref="/termes-et-conditions"
      html={content.body}
    />
  );
}

