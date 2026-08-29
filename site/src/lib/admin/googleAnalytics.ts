import crypto from "crypto";

// Accès en lecture seule à Google Analytics (GA4 Data API) via un compte de
// service — pas de dépendance npm dédiée (googleapis est lourde), juste un
// échange OAuth JWT signé à la main puis un appel REST classique.

type ServiceAccount = { client_email: string; private_key: string; token_uri: string };

function base64url(input: Buffer | string): string {
  return (Buffer.isBuffer(input) ? input : Buffer.from(input))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function getAccessToken(sa: ServiceAccount): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: sa.token_uri,
      exp: now + 3600,
      iat: now,
    })
  );
  const signInput = `${header}.${payload}`;
  const signature = crypto.createSign("RSA-SHA256").update(signInput).sign(sa.private_key);
  const jwt = `${signInput}.${base64url(signature)}`;

  const res = await fetch(sa.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    console.error("[ga] Échec obtention token :", res.status, await res.text());
    return null;
  }
  const body = (await res.json()) as { access_token?: string };
  return body.access_token ?? null;
}

export type GaVisits = { total: number; series: number[] };

/** Visites (utilisateurs actifs) des 30 derniers jours, par jour — ou null si
 * la connexion GA échoue (identifiants absents/invalides), jamais un chiffre
 * inventé. */
export async function fetchGaVisits30Days(): Promise<GaVisits | null> {
  const propertyId = process.env.GA_PROPERTY_ID;
  const rawJson = process.env.GA_SERVICE_ACCOUNT_JSON;
  if (!propertyId || !rawJson) return null;

  let sa: ServiceAccount;
  try {
    sa = JSON.parse(rawJson);
  } catch {
    console.error("[ga] GA_SERVICE_ACCOUNT_JSON invalide (pas un JSON valide).");
    return null;
  }

  const token = await getAccessToken(sa);
  if (!token) return null;

  try {
    const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate: "29daysAgo", endDate: "today" }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      }),
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.error("[ga] Échec runReport :", res.status, await res.text());
      return null;
    }
    const body = (await res.json()) as { rows?: { metricValues: { value: string }[] }[] };
    const series = (body.rows ?? []).map((r) => Number(r.metricValues[0]?.value ?? 0));
    const total = series.reduce((sum, n) => sum + n, 0);
    return { total, series };
  } catch (err) {
    console.error("[ga] Erreur d'appel GA Data API :", err);
    return null;
  }
}
