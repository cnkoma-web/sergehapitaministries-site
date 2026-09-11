document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-demo-contact]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const feedback = form.querySelector("[data-form-feedback]");
      if (feedback) feedback.textContent = "Dans le développement final, ce message sera envoyé puis redirigé vers la page de confirmation.";
    });
  });

  document.querySelectorAll("[data-demo-invitation]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const start = form.querySelector("[name=date_debut]");
      const end = form.querySelector("[name=date_fin]");
      end.setCustomValidity(start.value && end.value && end.value < start.value ? "La date de fin doit être postérieure à la date de début." : "");
      if (!form.reportValidity()) return;
      const feedback = form.querySelector("[data-form-feedback]");
      if (feedback) feedback.textContent = "Dans le développement final, cette demande sera enregistrée puis redirigée vers la page de confirmation.";
    });
  });

  document.querySelectorAll("[data-donation-form]").forEach((form) => {
    const frequencyButtons = [...form.querySelectorAll("[data-frequency]")];
    const amountButtons = [...form.querySelectorAll("[data-amount]")];
    const customButton = form.querySelector("[data-custom-amount-toggle]");
    const customField = form.querySelector("[data-custom-amount-field]");
    const customInput = form.querySelector("[data-custom-amount]");
    const comment = form.querySelector("[data-donation-comment]");
    const count = form.querySelector("[data-comment-count]");
    const submit = form.querySelector("[data-donation-submit]");
    const feedback = form.querySelector("[data-form-feedback]");
    let amount = 10;

    const refreshSubmit = () => {
      const validAmount = Number(amount) > 0 ? Number(amount) : 0;
      submit.textContent = validAmount ? `Faire un don de ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(validAmount)}` : "Choisir un montant";
      submit.disabled = !validAmount;
    };

    frequencyButtons.forEach((button) => button.addEventListener("click", () => {
      frequencyButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
    }));

    amountButtons.forEach((button) => button.addEventListener("click", () => {
      amountButtons.forEach((item) => item.classList.toggle("active", item === button));
      customButton.classList.remove("active");
      customField.hidden = true;
      amount = Number(button.dataset.amount);
      refreshSubmit();
    }));

    customButton.addEventListener("click", () => {
      amountButtons.forEach((item) => item.classList.remove("active"));
      customButton.classList.add("active");
      customField.hidden = false;
      amount = Number(customInput.value || 0);
      refreshSubmit();
      customInput.focus();
    });

    customInput.addEventListener("input", () => {
      amount = Number(customInput.value || 0);
      refreshSubmit();
    });

    comment.addEventListener("input", () => {
      count.textContent = String(comment.value.length);
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!Number(amount)) return;
      feedback.textContent = "Dans le développement final, ce bouton ouvrira le paiement sécurisé Stripe avec la fréquence et le montant choisis.";
    });

    refreshSubmit();
  });
});
