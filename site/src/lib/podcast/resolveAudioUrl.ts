function decodeXml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalisePostUrl(value: string): string | null {
  try {
    const url = new URL(decodeXml(value.trim()));
    return `${url.origin}${url.pathname.replace(/\/$/, "")}`;
  } catch {
    return null;
  }
}

function getEnclosureUrl(item: string): string | null {
  const enclosure = item.match(/<enclosure\b[^>]*>/i)?.[0];
  const url = enclosure?.match(/\burl=(["'])(.*?)\1/i)?.[2];
  return url ? decodeXml(url) : null;
}

/**
 * Substack exposes the actual media URL as an RSS enclosure, while the URL
 * copied by an editor points to the public post. Resolve that post URL on the
 * server so the CMS can keep accepting the simple link the editor sees.
 */
export async function resolvePodcastAudioUrl(value: string): Promise<string> {
  let postUrl: URL;
  try {
    postUrl = new URL(value);
  } catch {
    return value;
  }

  const isSubstackPost =
    (postUrl.hostname === "substack.com" || postUrl.hostname.endsWith(".substack.com")) &&
    postUrl.pathname.startsWith("/p/");
  if (!isSubstackPost) return value;

  try {
    const response = await fetch(new URL("/feed", postUrl.origin), {
      headers: { "User-Agent": "SergeHapitaMinistries/1.0" },
      next: { revalidate: 900 },
    });
    if (!response.ok) return value;

    const xml = await response.text();
    const expected = normalisePostUrl(postUrl.toString());
    const items = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];

    for (const item of items) {
      const linkMatch = item.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i)?.[1];
      const link = linkMatch ? normalisePostUrl(linkMatch) : null;
      if (link === expected || item.includes(postUrl.pathname)) {
        return getEnclosureUrl(item) ?? value;
      }
    }
  } catch (cause) {
    console.error("[podcast/substack] audio URL resolution failed", cause);
  }

  return value;
}
