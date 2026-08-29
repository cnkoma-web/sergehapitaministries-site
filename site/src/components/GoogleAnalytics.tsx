import Script from "next/script";

// Envoie les pages vues à Google Analytics (GA4) — le compte de service utilisé
// par le tableau de bord admin ne fait que LIRE ces données, ce script est ce
// qui les produit. N'installe rien tant que NEXT_PUBLIC_GA_MEASUREMENT_ID
// n'est pas configurée.
export default function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}
