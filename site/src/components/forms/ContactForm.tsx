"use client";

// TODO Phase 6 : soumission réelle (Resend + enregistrement en base) puis redirection
// vers /confirmation?type=contact, à la place de l'alert() ci-dessous — voir le plan
// d'implémentation (cahier-des-charges §Partie 5, point 8).
export default function ContactForm() {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        alert("Merci ! Votre message a bien été envoyé.");
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

      <div style={{ textAlign: "center" }}>
        <button type="submit" className="btn btn-primary" style={{ paddingLeft: 36, paddingRight: 36 }}>
          Envoyer →
        </button>
      </div>
    </form>
  );
}
