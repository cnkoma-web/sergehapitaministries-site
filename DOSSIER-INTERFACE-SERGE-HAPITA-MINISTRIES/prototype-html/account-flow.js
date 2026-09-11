document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-account-flow]");
  if (!root) return;

  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const icon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5 9 17l11-11"></path></svg>';
  const mailIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m4 7 8 6 8-6"></path></svg>';
  const templates = {
    "/compte/verification-email": {
      label: "Création du compte", title: "Vérifiez votre messagerie.",
      body: `<div class="account-flow-status">${mailIcon}<div><strong>L’e-mail de vérification a été envoyé.</strong><p>Ouvrez le message reçu et cliquez sur le lien pour activer votre compte.</p></div></div><div class="account-flow-links"><button class="account-link" type="button" data-demo-message="Un nouvel e-mail vient d’être envoyé.">Renvoyer l’e-mail</button><a href="/compte/">Revenir à la connexion</a></div>`
    },
    "/compte/mot-de-passe-oublie": {
      label: "Accès au compte", title: "Mot de passe oublié ?",
      body: `<p>Indiquez l’adresse e-mail associée à votre compte. Vous recevrez un lien pour choisir un nouveau mot de passe.</p><form class="account-flow-form" data-flow-form="/compte/email-envoye/"><label for="recovery-email">Adresse e-mail</label><input id="recovery-email" type="email" autocomplete="email" required><button type="submit">Recevoir le lien →</button></form><div class="account-flow-links"><a href="/compte/">Retour à la connexion</a></div>`
    },
    "/compte/email-envoye": {
      label: "Réinitialisation", title: "Consultez votre messagerie.",
      body: `<div class="account-flow-status">${mailIcon}<div><strong>Si un compte correspond à cette adresse, un e-mail a été envoyé.</strong><p>Le message contient un lien unique permettant de créer un nouveau mot de passe.</p></div></div><div class="account-flow-links"><a href="/compte/mot-de-passe-oublie/">Renvoyer un lien</a><a href="/compte/">Retour à la connexion</a></div>`
    },
    "/auth/confirm": {
      label: "Vérification sécurisée", title: "Vérification du lien…",
      body: `<p>Cette étape technique échange le jeton reçu par e-mail contre une session valide avant d’autoriser la suite du parcours.</p><div class="account-flow-status">${icon}<div><strong>État de démonstration</strong><p>En production, Supabase valide ici le lien une seule fois, puis redirige vers l’écran approprié.</p></div></div><div class="account-flow-links"><a href="/compte/nouveau-mot-de-passe/">Continuer vers le nouveau mot de passe</a><a href="/compte/compte-active/">Continuer vers le compte activé</a></div>`
    },
    "/compte/nouveau-mot-de-passe": {
      label: "Réinitialisation", title: "Créez un nouveau mot de passe.",
      body: `<p>Choisissez un mot de passe différent de l’ancien et confirmez-le.</p><form class="account-flow-form" data-password-form><label for="new-password">Nouveau mot de passe</label><input id="new-password" name="password" type="password" autocomplete="new-password" minlength="8" required><label for="new-password-confirmation">Confirmation du mot de passe</label><input id="new-password-confirmation" name="password_confirmation" type="password" autocomplete="new-password" minlength="8" required><ul class="password-rules"><li>Au moins 8 caractères</li><li>Les deux saisies doivent être identiques</li></ul><button type="submit">Enregistrer le mot de passe →</button></form>`
    },
    "/compte/mot-de-passe-modifie": {
      label: "Réinitialisation terminée", title: "Votre mot de passe a été modifié.",
      body: `<div class="account-flow-status">${icon}<div><strong>Vous pouvez vous reconnecter.</strong><p>Utilisez désormais votre nouveau mot de passe pour accéder à votre espace personnel.</p></div></div><div class="account-flow-links"><a class="account-flow-primary" href="/compte/">Se connecter →</a></div>`
    },
    "/compte/compte-active": {
      label: "Compte activé", title: "Votre adresse e-mail est confirmée.",
      body: `<div class="account-flow-status">${icon}<div><strong>Votre espace est prêt.</strong><p>Vous pouvez maintenant vous connecter et retrouver vos commandes, vos accès et vos avis.</p></div></div><div class="account-flow-links"><a class="account-flow-primary" href="/compte/">Se connecter →</a></div>`
    }
  };
  let state = templates[path] || templates["/compte/mot-de-passe-oublie"];
  if (path === "/auth/confirm" && new URLSearchParams(window.location.search).has("error")) {
    state = {
      label: "Lien non valide",
      title: "Ce lien a expiré ou a déjà été utilisé.",
      body: `<p>Pour protéger votre compte, chaque lien ne peut être utilisé qu’une seule fois et pendant une durée limitée.</p><div class="account-flow-links"><a class="account-flow-primary" href="/compte/mot-de-passe-oublie/">Recevoir un nouveau lien →</a><a href="/compte/">Retour à la connexion</a></div>`
    };
  }
  document.title = `${state.title.replace(/<[^>]+>/g, "")} — Serge Hapita Ministries`;
  root.innerHTML = `<section class="account-flow-card"><div class="account-flow-heading"><p class="eyebrow light"><span></span>${state.label}</p><h1>${state.title}</h1></div><div class="account-flow-body">${state.body}</div></section>`;

  root.querySelector("[data-flow-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    window.location.href = event.currentTarget.dataset.flowForm;
  });
  root.querySelector("[data-password-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const password = form.elements.password;
    const confirmation = form.elements.password_confirmation;
    confirmation.setCustomValidity(password.value === confirmation.value ? "" : "Les mots de passe ne correspondent pas.");
    if (!form.reportValidity()) return;
    window.location.href = "/compte/mot-de-passe-modifie/";
  });
  root.querySelector("[data-demo-message]")?.addEventListener("click", (event) => {
    const button = event.currentTarget;
    button.textContent = button.dataset.demoMessage;
    button.disabled = true;
  });
});
