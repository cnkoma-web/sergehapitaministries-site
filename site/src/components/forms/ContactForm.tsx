"use client";

import { useTransition } from "react";
import { submitContactForm } from "@/lib/forms/actions";

export default function ContactForm() {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(() => {
          submitContactForm(formData);
        });
      }}
    >
      <label htmlFor="contact-nom">Nom *</label>
      <input id="contact-nom" name="nom" type="text" required />

      <label htmlFor="contact-email">E-mail *</label>
      <input id="contact-email" name="email" type="email" required />

      <label htmlFor="contact-sujet">Sujet *</label>
      <select id="contact-sujet" name="sujet" required defaultValue="">
        <option value="" disabled>
          Sélectionnez un sujet
        </option>
        <option>Question générale</option>
        <option>Livres et publications</option>
        <option>Invitation</option>
        <option>Partenariat</option>
        <option>Presse / Médias</option>
        <option>Autre</option>
      </select>

      <label htmlFor="contact-message">Message *</label>
      <textarea id="contact-message" name="message" required />

      {/* Case RGPD (retour du 11/09, Lot 6) — ajoutée pour reproduire la
          maquette : purement une validation côté formulaire avant envoi,
          jamais stockée (aucune colonne dédiée sur contact_submissions),
          même principe que le consentement déjà réel du formulaire
          Invitation. */}
      <label className="v2-form-consent">
        <input type="checkbox" required />
        <span>
          J&apos;accepte que mes informations soient utilisées pour répondre à mon message, conformément à la{" "}
          <a href="/politique-de-confidentialite">politique de confidentialité</a>.
        </span>
      </label>

      <button type="submit" className="v2-primary-submit" disabled={isPending}>
        {isPending ? "Envoi…" : "Envoyer le message →"}
      </button>
    </form>
  );
}
