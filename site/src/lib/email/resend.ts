// Envoi d'e-mails via l'API HTTP de Resend (pas de dépendance npm dédiée —
// un simple POST authentifié suffit pour ce besoin). Compte Resend existant
// de Serge, réutilisé (cahier : pas de nouvel outil).
//
// Tant que RESEND_API_KEY n'est pas configurée (variable d'environnement
// Vercel), l'envoi est silencieusement ignoré : les formulaires restent
// pleinement fonctionnels (la donnée est toujours enregistrée en base), seule
// la notification par e-mail à Serge est différée jusqu'à la configuration
// de la clé.
const SENDER = "Serge Hapita Ministries <notifications@amdgeditions.fr>";

export async function sendNotificationEmail(subject: string, htmlBody: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  // Adresse de Serge qui doit recevoir les notifications de formulaires —
  // configurable sans toucher au code, jamais codée en dur (cahier : aucune
  // donnée réelle ne doit être inventée).
  const notifyTo = process.env.NOTIFICATION_EMAIL;
  if (!apiKey || !notifyTo) {
    console.warn(`[email] RESEND_API_KEY ou NOTIFICATION_EMAIL absente — notification "${subject}" non envoyée.`);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: SENDER,
        to: [notifyTo],
        subject,
        html: htmlBody,
      }),
    });
    if (!res.ok) {
      console.error(`[email] Échec envoi Resend (${res.status}) : ${await res.text()}`);
    }
  } catch (err) {
    // Une notification email ratée ne doit jamais faire échouer la soumission
    // du formulaire elle-même (la donnée est déjà enregistrée en base).
    console.error("[email] Erreur d'envoi Resend :", err);
  }
}
