"use client";

import { useTransition } from "react";
import { submitContactForm } from "@/lib/forms/actions";

// STRUCTURE corrigée (lot de finition, 16/09) : § .contact-form/.field de
// la maquette (prototype-html/contact/index.html + engagement.css) —
// conteneur .contact-form (grille/carte blanche) et chaque paire label+
// champ enveloppée dans .field, jamais des labels/inputs à plat comme
// avant (aucune de ces deux classes n'était posée). Champ "Sujet" ramené
// à un <input type="text"> réel comme la maquette — le <select> à options
// prédéfinies n'avait aucune base dans la maquette et submitContactForm
// ne traite le sujet que comme un texte libre, sans logique différenciée
// par valeur (aucune fonction perdue, purement une correction d'interface).
export default function ContactForm() {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="contact-form"
      action={(formData) => {
        startTransition(() => {
          submitContactForm(formData);
        });
      }}
    >
      <div className="field">
        <label htmlFor="contact-nom">Nom *</label>
        <input id="contact-nom" name="nom" type="text" autoComplete="name" required />
      </div>

      <div className="field">
        <label htmlFor="contact-email">E-mail *</label>
        <input id="contact-email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="field">
        <label htmlFor="contact-sujet">Sujet *</label>
        <input id="contact-sujet" name="sujet" type="text" required />
      </div>

      <div className="field">
        <label htmlFor="contact-message">Message *</label>
        <textarea id="contact-message" name="message" required />
      </div>

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
