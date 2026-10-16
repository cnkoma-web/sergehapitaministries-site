import { NextRequest, NextResponse } from "next/server";

const CANONICAL_ORIGIN = "https://sergehapitaministries.org";

const LEGACY_HOSTS = new Set([
  "sergehapita.org",
  "www.sergehapita.org",
  "sergehapita.com",
  "www.sergehapita.com",
]);

const LEGACY_EXACT_REDIRECTS = new Map<string, string>([
  ["/", "/"],
  ["/à-propos", "/de-serge"],
  ["/a-propos", "/de-serge"],
  ["/category/livres-chretiens", "/livres"],
  ["/services-4-1", "/videos"],
  ["/blog", "/publications"],
  ["/category/all-products", "/boutique"],
  ["/shop", "/boutique"],
  ["/invitation", "/invitation"],
  ["/partenariat", "/partenariat"],
  ["/connaitre-jesus", "/connaitre-jesus"],
  ["/mission", "/mission"],
  ["/contact", "/contact"],
  ["/politique-de-confidentialite", "/politique-de-confidentialite"],
  ["/politique-de-cookies", "/politique-de-cookies"],
  ["/termes-et-conditions", "/termes-et-conditions"],
  ["/mentions-legales", "/mentions-legales"],
]);

const LEGACY_BOOK_REDIRECTS = new Map<string, string>([
  ["tu-deviens-ce-que-tu-connais", "/livres/tu-deviens-ce-que-tu-connais"],
  [
    "pourquoi-suis-je-ne-de-nouveau",
    "/livres/pourquoi-suis-je-ne-de-nouveau",
  ],
  [
    "manifester-ce-que-dieu-a-prevu",
    "/livres/manifester-ce-que-dieu-a-prevu",
  ],
  [
    "les-hauts-lieux-dans-le-culte-moderne",
    "/livres/les-hauts-lieux-dans-le-culte-moderne",
  ],
  [
    "ton-corps-t-ecoute-quand-la-parole-recree-l-adn",
    "/livres/ton-corps-t-ecoute",
  ],
  [
    "david-le-fugitif-du-royaume-l-invisible-ascension",
    "/livres/david-le-fugitif-du-royaume-vol-1",
  ],
  [
    "marcher-dans-la-foi-qui-plait-a-dieu-volet-2",
    "/livres/marcher-dans-la-foi-volet-2",
  ],
]);

const CURRENT_PUBLIC_PATHS = new Set([
  "/boutique",
  "/connaitre-jesus",
  "/contact",
  "/de-serge",
  "/invitation",
  "/livres",
  "/mentions-legales",
  "/mission",
  "/partenariat",
  "/podcast",
  "/politique-de-confidentialite",
  "/politique-de-cookies",
  "/publications",
  "/rosee-matinale",
  "/termes-et-conditions",
  "/videos",
]);

const CURRENT_DYNAMIC_PREFIXES = [
  "/boutique/",
  "/livres/",
  "/podcast/",
  "/publications/",
  "/rosee-matinale/",
];

function normalizePathname(pathname: string) {
  try {
    return (
      decodeURIComponent(pathname)
        .normalize("NFC")
        .toLocaleLowerCase("fr")
        .replace(/\/$/, "") || "/"
    );
  } catch {
    return pathname.toLocaleLowerCase("fr").replace(/\/$/, "") || "/";
  }
}

function legacyDestination(pathname: string) {
  const normalizedPath = normalizePathname(pathname);
  const exactDestination = LEGACY_EXACT_REDIRECTS.get(normalizedPath);

  if (exactDestination) {
    return exactDestination;
  }

  if (normalizedPath.startsWith("/product-page/")) {
    const productSlug = normalizedPath.slice("/product-page/".length);
    return LEGACY_BOOK_REDIRECTS.get(productSlug) ?? "/livres";
  }

  // Les anciens articles Wix ne disposent pas tous d'un équivalent éditorial
  // individuel. La page Publications est leur destination thématique pérenne.
  if (normalizedPath.startsWith("/post/")) {
    return "/publications";
  }

  if (
    CURRENT_PUBLIC_PATHS.has(normalizedPath) ||
    CURRENT_DYNAMIC_PREFIXES.some((prefix) => normalizedPath.startsWith(prefix))
  ) {
    return normalizedPath;
  }

  return "/";
}

export function proxy(request: NextRequest) {
  const hostname = request.nextUrl.hostname.toLowerCase();

  if (!LEGACY_HOSTS.has(hostname)) {
    return NextResponse.next();
  }

  const destination = new URL(
    legacyDestination(request.nextUrl.pathname),
    CANONICAL_ORIGIN,
  );

  return NextResponse.redirect(destination, 308);
}

export const config = {
  matcher: "/:path*",
};
