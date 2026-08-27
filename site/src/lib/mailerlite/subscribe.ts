"use server";

// Inscription à la newsletter "ParoleDeViePourVous" via l'API MailerLite (compte
// existant de Serge, réutilisé — cahier §Partie 5 point 8). Tant que
// MAILERLITE_API_KEY / MAILERLITE_GROUP_ID ne sont pas configurées, l'inscription
// échoue proprement (message honnête côté formulaire) plutôt que de simuler un succès.
export async function subscribeToNewsletter(email: string): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.MAILERLITE_API_KEY;
  const groupId = process.env.MAILERLITE_GROUP_ID;

  if (!apiKey || !groupId) {
    console.warn("[newsletter] MAILERLITE_API_KEY ou MAILERLITE_GROUP_ID absente — inscription non envoyée.");
    return { ok: false, error: "not-configured" };
  }

  if (!email || !email.includes("@")) {
    return { ok: false, error: "invalid-email" };
  }

  try {
    const res = await fetch(`https://connect.mailerlite.com/api/subscribers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, groups: [groupId] }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[newsletter] Échec MailerLite (${res.status}) : ${body}`);
      return { ok: false, error: "mailerlite-failed" };
    }

    return { ok: true };
  } catch (err) {
    console.error("[newsletter] Erreur d'appel MailerLite :", err);
    return { ok: false, error: "mailerlite-failed" };
  }
}
