document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-confirmation]");
  if (!root) return;
  const type = new URLSearchParams(window.location.search).get("type") || "contact";
  const states = {
    contact: ["Message envoyé", "Nous avons bien reçu votre message.", "Une réponse vous sera adressée à l’adresse e-mail indiquée.", "/", "Revenir à l’accueil"],
    invitation: ["Demande transmise", "Votre invitation a bien été envoyée.", "Les informations transmises vont être examinées avant qu’une réponse vous soit adressée.", "/invitation/", "Revenir à l’invitation"],
    don: ["Merci pour votre soutien", "Votre confirmation a bien été enregistrée.", "Le reçu et les informations utiles vous seront adressés par e-mail selon le traitement Stripe existant.", "/partenariat/", "Revenir au partenariat"],
    avis: ["Avis reçu", "Merci d’avoir partagé votre avis.", "Il apparaîtra sur le site après validation.", "/livres/", "Revenir aux livres"],
    newsletter: ["Inscription enregistrée", "Merci de rejoindre ParoleDeViePourVous.", "Consultez votre messagerie pour confirmer votre inscription si cette vérification est activée dans MailerLite.", "/", "Revenir à l’accueil"],
    commande: ["Commande confirmée", "Votre commande a bien été enregistrée.", "Le récapitulatif et les informations de suivi vous seront adressés par e-mail.", "/mon-compte/", "Voir mon espace"]
  };
  const [label, title, message, href, action] = states[type] || states.contact;
  root.innerHTML = `<section class="account-flow-card"><div class="account-flow-heading"><p class="eyebrow light"><span></span>${label}</p><h1>${title}</h1></div><div class="account-flow-body"><div class="account-flow-status"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5 9 17l11-11"></path></svg><div><strong>Confirmation</strong><p>${message}</p></div></div><div class="account-flow-links"><a class="account-flow-primary" href="${href}">${action} →</a></div></div></section>`;
});
