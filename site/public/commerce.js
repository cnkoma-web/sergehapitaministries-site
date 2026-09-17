document.addEventListener("DOMContentLoaded", () => {
  const storageKey = "shm-cart-v1";
  const readCart = () => {
    try {
      const value = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  };
  const writeCart = (cart) => {
    window.localStorage.setItem(storageKey, JSON.stringify(cart));
    updateCartBadges(cart);
  };
  const updateCartBadges = (cart = readCart()) => {
    const total = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    document.querySelectorAll(".cart-count").forEach((badge) => {
      badge.textContent = String(total);
      badge.setAttribute("aria-label", `${total} article${total > 1 ? "s" : ""}`);
    });
  };
  const money = (value) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));

  updateCartBadges();

  document.querySelectorAll("[data-add-cart]").forEach((button) => {
    button.addEventListener("click", () => {
      const cart = readCart();
      const slug = button.dataset.productSlug;
      const quantitySource = button.dataset.quantitySource;
      const requestedQuantity = Number((quantitySource ? document.querySelector(quantitySource)?.textContent : null) || 1);
      const existing = cart.find((item) => item.slug === slug);
      if (existing) existing.quantity += requestedQuantity;
      else cart.push({
        slug,
        title: button.dataset.productTitle,
        price: Number(button.dataset.productPrice),
        image: button.dataset.productImage,
        url: button.dataset.productUrl,
        kind: "Livre",
        quantity: requestedQuantity
      });
      writeCart(cart);
      button.classList.add("is-added");
      const originalLabel = button.dataset.originalLabel || button.getAttribute("aria-label") || button.textContent.trim();
      button.dataset.originalLabel = originalLabel;
      if (button.matches(".add-to-cart-primary")) button.textContent = "Ajouté au panier ✓";
      else button.setAttribute("aria-label", "Ajouté au panier");
      window.setTimeout(() => {
        button.classList.remove("is-added");
        if (button.matches(".add-to-cart-primary")) button.textContent = originalLabel;
        else button.setAttribute("aria-label", originalLabel);
      }, 1500);
    });
  });

  document.querySelectorAll("[data-quantity-picker]").forEach((picker) => {
    const output = picker.querySelector("output");
    picker.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        const next = Math.max(1, Math.min(9, Number(output.textContent) + Number(button.dataset.delta)));
        output.textContent = String(next);
      });
    });
  });

  const catalogCards = [...document.querySelectorAll("[data-catalog-item]")];
  const pageButtons = [...document.querySelectorAll("[data-catalog-page]")];
  const showCatalogPage = (page) => {
    catalogCards.forEach((card, index) => {
      card.hidden = Math.ceil((index + 1) / 4) !== page;
    });
    pageButtons.forEach((button) => {
      if (Number(button.dataset.catalogPage) === page) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
  };
  pageButtons.forEach((button) => button.addEventListener("click", () => {
    showCatalogPage(Number(button.dataset.catalogPage));
    document.querySelector(".catalog-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }));
  if (catalogCards.length) showCatalogPage(1);

  const cartRoot = document.querySelector("[data-cart-items]");
  const cartEmpty = document.querySelector("[data-cart-empty]");
  const cartCountLabel = document.querySelector("[data-cart-count-label]");
  const subtotalNode = document.querySelector("[data-cart-subtotal]");
  const totalNode = document.querySelector("[data-cart-total]");
  const checkoutButton = document.querySelector("[data-checkout]");

  const renderCart = () => {
    if (!cartRoot) return;
    const cart = readCart();
    const quantity = cart.reduce((sum, item) => sum + Number(item.quantity), 0);
    const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    cartRoot.innerHTML = cart.map((item) => `
      <article class="cart-item" data-cart-slug="${escapeHtml(item.slug)}">
        <a href="${escapeHtml(item.url)}"><img src="${escapeHtml(item.image)}" alt="Couverture de ${escapeHtml(item.title)}"></a>
        <div>
          <span class="cart-item-kind">${escapeHtml(item.kind || "Livre")}</span>
          <h3><a href="${escapeHtml(item.url)}">${escapeHtml(item.title)}</a></h3>
          <p>${money(Number(item.price))}</p>
        </div>
        <div class="cart-item-actions">
          <div class="cart-quantity" aria-label="Quantité">
            <button type="button" data-cart-delta="-1" aria-label="Diminuer la quantité">−</button>
            <span>${Number(item.quantity)}</span>
            <button type="button" data-cart-delta="1" aria-label="Augmenter la quantité">+</button>
          </div>
          <button class="cart-remove" type="button" data-cart-remove>Retirer</button>
        </div>
      </article>
    `).join("");
    if (cartEmpty) cartEmpty.hidden = cart.length > 0;
    cartRoot.hidden = cart.length === 0;
    if (cartCountLabel) cartCountLabel.textContent = `${quantity} article${quantity > 1 ? "s" : ""}`;
    if (subtotalNode) subtotalNode.textContent = money(subtotal);
    if (totalNode) totalNode.textContent = money(subtotal);
    if (checkoutButton) checkoutButton.disabled = cart.length === 0;
    updateCartBadges(cart);
  };

  cartRoot?.addEventListener("click", (event) => {
    const itemNode = event.target.closest("[data-cart-slug]");
    if (!itemNode) return;
    const cart = readCart();
    const index = cart.findIndex((item) => item.slug === itemNode.dataset.cartSlug);
    if (index < 0) return;
    const deltaButton = event.target.closest("[data-cart-delta]");
    if (deltaButton) {
      cart[index].quantity = Math.max(1, Math.min(99, Number(cart[index].quantity) + Number(deltaButton.dataset.cartDelta)));
      writeCart(cart);
      renderCart();
      return;
    }
    if (event.target.closest("[data-cart-remove]")) {
      cart.splice(index, 1);
      writeCart(cart);
      renderCart();
    }
  });
  renderCart();

  const checkoutDialog = document.querySelector("[data-checkout-dialog]");
  checkoutButton?.addEventListener("click", () => checkoutDialog?.showModal());
  checkoutDialog?.querySelectorAll("[data-dialog-close]").forEach((button) => button.addEventListener("click", () => checkoutDialog.close()));

  document.querySelectorAll("[data-account-tabs]").forEach((tablist) => {
    const tabs = [...tablist.querySelectorAll("[role=tab]")];
    const panes = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));
    const activate = (tab) => {
      tabs.forEach((item, index) => {
        const selected = item === tab;
        item.setAttribute("aria-selected", String(selected));
        panes[index].hidden = !selected;
      });
    };
    tabs.forEach((tab) => tab.addEventListener("click", () => activate(tab)));
    const requested = new URLSearchParams(window.location.search).get("tab");
    const initial = tabs.find((tab) => tab.dataset.tab === requested) || tabs[0];
    activate(initial);
  });

  document.querySelectorAll("[data-demo-auth]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (form.matches("[data-signup-form]")) {
        const password = form.querySelector("[name=password]");
        const confirmation = form.querySelector("[name=password_confirmation]");
        confirmation.setCustomValidity(password.value === confirmation.value ? "" : "Les mots de passe ne correspondent pas.");
        if (!form.reportValidity()) return;
        window.location.href = "/compte/verification-email/";
        return;
      }
      window.location.href = "/mon-compte/";
    });
  });

  document.querySelectorAll("[data-oauth-demo]").forEach((button) => {
    button.addEventListener("click", () => {
      window.alert(`La connexion avec ${button.dataset.oauthDemo} sera reliée à Supabase Auth dans le développement final.`);
    });
  });

  const dashboardTabs = [...document.querySelectorAll("[data-dashboard-tab]")];
  const dashboardPanels = [...document.querySelectorAll("[data-dashboard-panel]")];
  dashboardTabs.forEach((tab) => tab.addEventListener("click", () => {
    dashboardTabs.forEach((item) => item.setAttribute("aria-selected", String(item === tab)));
    dashboardPanels.forEach((panel) => { panel.hidden = panel.id !== tab.getAttribute("aria-controls"); });
  }));

  document.querySelectorAll("[data-review-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const note = form.querySelector("[data-review-note]");
      if (note) note.textContent = "Merci. Votre avis sera visible après modération.";
      form.reset();
    });
  });
});
