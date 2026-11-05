import type { Metadata } from "next";
import LegalPageLayout from "@/components/layout/LegalPageLayout";
import { getPageContent } from "@/lib/content/pageContent";

const title = "Politique de cookies | Serge Hapita Ministries";
const description = "Politique de cookies du site sergehapitaministries.org.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/politique-de-cookies" },
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    title,
    description,
    url: "/politique-de-cookies",
    siteName: "Serge Hapita Ministries",
    locale: "fr_FR",
  },
  twitter: { card: "summary_large_image", title, description },
};

export default async function PolitiqueDeCookiesPage() {
  const content = await getPageContent("politique-de-cookies");
  return (
    <LegalPageLayout
      title={content.title}
      lastUpdate={content.last_update}
      currentHref="/politique-de-cookies"
      html={content.body}
    />
  );
}

