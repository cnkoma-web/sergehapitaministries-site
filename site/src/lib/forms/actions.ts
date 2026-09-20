"use server";

import { redirect } from "next/navigation";
import { sendNotificationEmail, sendCustomerEmail } from "@/lib/email/resend";
import { renderGabaritEmail } from "@/lib/email/template";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { escapeHtml, emailSubjectText } from "@/lib/security/html";
import { allowSubmission } from "@/lib/security/rateLimit";
import { verifyHumanForm } from "@/lib/security/turnstile";
import {
  allowedValue,
  optionalText,
  PublicFormError,
  requiredText,
  validDate,
  validEmail,
} from "@/lib/security/validation";

// Les trois formulaires ci-dessous remplacent les alert() des maquettes
// statiques (cahier §Partie 5, point 8) : après validation serveur et
// protection anti-robots, la donnée est enregistrée via le client serveur
// privilégié. Les rôles navigateur n'ont donc plus besoin d'insérer
// directement en base. Une notification est envoyée à Serge si
// RESEND_API_KEY/NOTIFICATION_EMAIL sont configurées (sinon envoi différé,
// aucune perte de donnée).

function rejectSubmission(): never {
  throw new PublicFormError("La vérification de sécurité a échoué. Actualisez la page et réessayez.");
}

export async function submitContactForm(formData: FormData): Promise<void> {
  if (!(await verifyHumanForm(formData, "contact"))) rejectSubmission();

  const nom = requiredText(formData, "nom", 120);
  const email = validEmail(formData);
  const sujet = requiredText(formData, "sujet", 180);
  const message = requiredText(formData, "message", 5000);
  if (!(await allowSubmission({ scope: "contact", limit: 5, windowSeconds: 3600, identity: email }))) {
    rejectSubmission();
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("contact_submissions").insert({ nom, email, sujet, message });
  if (error) {
    console.error("[contact] Insertion refusée :", error.message);
    throw new Error("Impossible d'envoyer le message pour le moment.");
  }

  const safeNom = escapeHtml(nom);
  const safeEmail = escapeHtml(email);
  const safeSujet = escapeHtml(sujet);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");
  await sendNotificationEmail(
    `Nouveau message de contact — ${emailSubjectText(sujet)}`,
    `<p><strong>${safeNom}</strong> (${safeEmail})</p><p><strong>Sujet :</strong> ${safeSujet}</p><p>${safeMessage}</p>`
  );

  // Accusé de réception au visiteur (Lot 10, 11/09) — reproduit
  // gabarits-emails/accuse-reception-contact.html. Décidé avec Serge :
  // nouvel envoi réel, pas seulement un gabarit préparé sans être branché.
  // "{{ prenom }}" du gabarit devient le nom complet saisi (le formulaire
  // n'a qu'un seul champ "Nom", pas de prénom séparé — jamais de donnée
  // inventée pour coller au gabarit).
  await sendCustomerEmail(
    email,
    "Votre message a bien été reçu",
    renderGabaritEmail({
      eyebrow: "Contact",
      title: "Votre message a bien été reçu.",
      bodyHtml:
        `<p style="margin:0 0 18px;color:#5f5a6d;font-size:16px;line-height:1.7">Bonjour ${safeNom},</p>` +
        `<p style="margin:0 0 25px;color:#5f5a6d;font-size:16px;line-height:1.7">Merci pour votre message. Une réponse vous sera adressée dès que possible.</p>` +
        `<p style="margin:0;color:#8b8695;font-size:12px;line-height:1.6">Serge Hapita Ministries</p>`,
    })
  );

  redirect("/confirmation?type=contact");
}

export async function submitInvitationForm(formData: FormData): Promise<void> {
  if (!(await verifyHumanForm(formData, "invitation"))) rejectSubmission();

  const row = {
    prenom: requiredText(formData, "prenom", 100),
    nom: requiredText(formData, "nom", 100),
    email: validEmail(formData),
    telephone: requiredText(formData, "telephone", 40),
    hote: requiredText(formData, "hote", 180),
    pays: requiredText(formData, "pays", 100),
    ville: requiredText(formData, "ville", 120),
    type_invitation: allowedValue(formData, "type_invitation", ["Conférence", "Séminaire", "Culte / Prédication", "Formation", "Autre"]),
    ministere_desire: allowedValue(formData, "ministere_desire", ["Enseignement de la Parole", "Message prophétique", "Guérison / Délivrance", "Autre"]),
    theme: requiredText(formData, "theme", 240),
    date_debut: validDate(formData, "date_debut"),
    date_fin: validDate(formData, "date_fin"),
    contact_sur_place: optionalText(formData, "contact_sur_place", 240),
    frais_couverts: allowedValue(formData, "frais_couverts", ["Oui", "Non", "À discuter"]),
    comment_connu: optionalText(formData, "comment_connu", 500),
    message: optionalText(formData, "message", 5000),
  };
  if (row.date_fin < row.date_debut) throw new PublicFormError("La date de fin doit suivre la date de début.");
  if (!(await allowSubmission({ scope: "invitation", limit: 3, windowSeconds: 86400, identity: row.email }))) {
    rejectSubmission();
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("invitation_submissions").insert(row);
  if (error) {
    console.error("[invitation] Insertion refusée :", error.message);
    throw new Error("Impossible d'envoyer la demande pour le moment.");
  }

  const safe = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, value === null ? null : escapeHtml(value)])
  ) as typeof row;
  await sendNotificationEmail(
    `Nouvelle demande d'invitation — ${emailSubjectText(row.hote)}`,
    `<p><strong>${safe.prenom} ${safe.nom}</strong> (${safe.email}, ${safe.telephone})</p>` +
      `<p><strong>Hôte :</strong> ${safe.hote} — ${safe.ville}, ${safe.pays}</p>` +
      `<p><strong>Type :</strong> ${safe.type_invitation} — <strong>Ministère désiré :</strong> ${safe.ministere_desire}</p>` +
      `<p><strong>Thème :</strong> ${safe.theme}</p>` +
      `<p><strong>Dates :</strong> du ${safe.date_debut} au ${safe.date_fin}</p>` +
      `<p><strong>Frais couverts :</strong> ${safe.frais_couverts}</p>` +
      (safe.message ? `<p>${safe.message.replace(/\n/g, "<br>")}</p>` : "")
  );

  redirect("/confirmation?type=invitation");
}

export async function submitPrayerForm(formData: FormData): Promise<void> {
  if (!(await verifyHumanForm(formData, "prayer"))) rejectSubmission();

  const nom = optionalText(formData, "nom", 120);
  const ville = optionalText(formData, "ville", 120);
  const email = validEmail(formData);
  const telephone = optionalText(formData, "telephone", 40);
  const accepte_contact = formData.get("accepte_contact") === "on";
  if (!(await allowSubmission({ scope: "prayer", limit: 5, windowSeconds: 3600, identity: email }))) {
    rejectSubmission();
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("prayer_submissions")
    .insert({ nom, ville, email, telephone, accepte_contact });
  if (error) {
    console.error("[prayer] Insertion refusée :", error.message);
    throw new Error("Impossible d'envoyer votre démarche pour le moment.");
  }

  await sendNotificationEmail(
    "Nouvelle prière du salut",
    `<p><strong>${nom ? escapeHtml(nom) : "Anonyme"}</strong> (${escapeHtml(email)}${telephone ? `, ${escapeHtml(telephone)}` : ""}${ville ? `, ${escapeHtml(ville)}` : ""})</p>` +
      `<p>Accepte d'être contacté(e) : ${accepte_contact ? "oui" : "non"}</p>`
  );

  redirect("/confirmation?type=priere");
}
