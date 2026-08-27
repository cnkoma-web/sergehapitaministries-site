"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendNotificationEmail } from "@/lib/email/resend";

// Les trois formulaires ci-dessous remplacent les alert() des maquettes
// statiques (cahier §Partie 5, point 8) : la donnée est toujours enregistrée
// en base (RLS ouverte à l'insertion publique — voir migration
// forms_and_donations), et une notification est envoyée à Serge si
// RESEND_API_KEY/NOTIFICATION_EMAIL sont configurées (sinon envoi différé,
// aucune perte de donnée).

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function submitContactForm(formData: FormData): Promise<void> {
  const nom = str(formData, "nom");
  const email = str(formData, "email");
  const sujet = str(formData, "sujet");
  const message = str(formData, "message");

  const supabase = await createClient();
  const { error } = await supabase.from("contact_submissions").insert({ nom, email, sujet, message });
  if (error) throw new Error("Impossible d'envoyer le message pour le moment.");

  await sendNotificationEmail(
    `Nouveau message de contact — ${sujet}`,
    `<p><strong>${nom}</strong> (${email})</p><p><strong>Sujet :</strong> ${sujet}</p><p>${message.replace(/\n/g, "<br>")}</p>`
  );

  redirect("/confirmation?type=contact");
}

export async function submitInvitationForm(formData: FormData): Promise<void> {
  const row = {
    prenom: str(formData, "prenom"),
    nom: str(formData, "nom"),
    email: str(formData, "email"),
    telephone: str(formData, "telephone"),
    hote: str(formData, "hote"),
    pays: str(formData, "pays"),
    ville: str(formData, "ville"),
    type_invitation: str(formData, "type_invitation"),
    ministere_desire: str(formData, "ministere_desire"),
    theme: str(formData, "theme"),
    date_debut: str(formData, "date_debut"),
    date_fin: str(formData, "date_fin"),
    contact_sur_place: str(formData, "contact_sur_place") || null,
    frais_couverts: str(formData, "frais_couverts"),
    comment_connu: str(formData, "comment_connu") || null,
    message: str(formData, "message") || null,
  };

  const supabase = await createClient();
  const { error } = await supabase.from("invitation_submissions").insert(row);
  if (error) throw new Error("Impossible d'envoyer la demande pour le moment.");

  await sendNotificationEmail(
    `Nouvelle demande d'invitation — ${row.hote}`,
    `<p><strong>${row.prenom} ${row.nom}</strong> (${row.email}, ${row.telephone})</p>` +
      `<p><strong>Hôte :</strong> ${row.hote} — ${row.ville}, ${row.pays}</p>` +
      `<p><strong>Type :</strong> ${row.type_invitation} — <strong>Ministère désiré :</strong> ${row.ministere_desire}</p>` +
      `<p><strong>Thème :</strong> ${row.theme}</p>` +
      `<p><strong>Dates :</strong> du ${row.date_debut} au ${row.date_fin}</p>` +
      `<p><strong>Frais couverts :</strong> ${row.frais_couverts}</p>` +
      (row.message ? `<p>${row.message.replace(/\n/g, "<br>")}</p>` : "")
  );

  redirect("/confirmation?type=invitation");
}

export async function submitPrayerForm(formData: FormData): Promise<void> {
  const nom = str(formData, "nom") || null;
  const ville = str(formData, "ville") || null;
  const email = str(formData, "email");
  const telephone = str(formData, "telephone") || null;
  const accepte_contact = formData.get("accepte_contact") === "on";

  const supabase = await createClient();
  const { error } = await supabase
    .from("prayer_submissions")
    .insert({ nom, ville, email, telephone, accepte_contact });
  if (error) throw new Error("Impossible d'envoyer votre démarche pour le moment.");

  await sendNotificationEmail(
    "Nouvelle prière du salut",
    `<p><strong>${nom ?? "Anonyme"}</strong> (${email}${telephone ? `, ${telephone}` : ""}${ville ? `, ${ville}` : ""})</p>` +
      `<p>Accepte d'être contacté(e) : ${accepte_contact ? "oui" : "non"}</p>`
  );

  redirect("/confirmation?type=priere");
}
