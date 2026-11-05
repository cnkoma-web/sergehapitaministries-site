import type { Metadata } from "next";
import LegalPageLayout from "@/components/layout/LegalPageLayout";
import { getPageContent } from "@/lib/content/pageContent";

const title = "Politique de confidentialité | Serge Hapita Ministries";
const description = "Politique de confidentialité du site sergehapitaministries.org.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/politique-de-confidentialite" },
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    title,
    description,
    url: "/politique-de-confidentialite",
    siteName: "Serge Hapita Ministries",
    locale: "fr_FR",
  },
  twitter: { card: "summary_large_image", title, description },
};

export default async function PolitiqueDeConfidentialitePage() {
  const content = await getPageContent("politique-de-confidentialite");
  return (
    <LegalPageLayout
      title={content.title}
      lastUpdate={content.last_update}
      currentHref="/politique-de-confidentialite"
      html={content.body}
    />
  );
}

