// Envoi d'e-mails via l'API HTTP de Resend (pas de dépendance npm dédiée —
// un simple POST authentifié suffit pour ce besoin). Compte Resend existant
// de Serge, réutilisé (cahier : pas de nouvel outil).
//
// Tant que RESEND_API_KEY n'est pas configurée (variable d'environnement
// Vercel), l'envoi est silencieusement ignoré : les formulaires restent
// pleinement fonctionnels (la donnée est toujours enregistrée en base), seule
// la notification par e-mail est différée jusqu'à la configuration de la clé.
const SENDER = "Serge Hapita Ministries <notifications@amdgeditions.fr>";

async function sendEmail(to: string, subject: string, htmlBody: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[email] RESEND_API_KEY absente — e-mail "${subject}" (à ${to}) non envoyé.`);
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
        to: [to],
        subject,
        html: htmlBody,
      }),
    });
    if (!res.ok) {
      console.error(`[email] Échec envoi Resend (${res.status}) à ${to} : ${await res.text()}`);
    }
  } catch (err) {
    // Un envoi raté ne doit jamais faire échouer l'opération qui le déclenche
    // (commande déjà enregistrée, formulaire déjà soumis, etc.).
    console.error("[email] Erreur d'envoi Resend :", err);
  }
}

/** Notifie Serge (adresse configurée via NOTIFICATION_EMAIL) — contact,
 * invitation, prière, don. */
export async function sendNotificationEmail(subject: string, htmlBody: string): Promise<void> {
  const notifyTo = process.env.NOTIFICATION_EMAIL;
  if (!notifyTo) {
    console.warn(`[email] NOTIFICATION_EMAIL absente — notification "${subject}" non envoyée.`);
    return;
  }
  await sendEmail(notifyTo, subject, htmlBody);
}

/** Envoie un e-mail transactionnel directement à un client (confirmation de
 * commande, avis approuvé...). N'envoie rien si l'adresse est vide/absente
 * (ex. session anonyme sans e-mail réel). */
export async function sendCustomerEmail(to: string | null | undefined, subject: string, htmlBody: string): Promise<void> {
  if (!to) return;
  await sendEmail(to, subject, htmlBody);
}
