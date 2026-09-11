document.addEventListener("DOMContentLoaded", () => {
  const localRouteMap = new Map([
    ["https://sergehapitaministries.org/mon-compte", "/compte/"],
    ["https://www.sergehapitaministries.org/mon-compte", "/compte/"],
    ["https://sergehapitaministries.org/panier", "/panier/"],
    ["https://www.sergehapitaministries.org/panier", "/panier/"]
  ]);
  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (localRouteMap.has(href)) link.setAttribute("href", localRouteMap.get(href));
    if (href === "#livres" || href === "../#livres") link.setAttribute("href", "/livres/");
  });

  try {
    const cart = JSON.parse(window.localStorage.getItem("shm-cart-v1") || "[]");
    const total = Array.isArray(cart) ? cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0) : 0;
    document.querySelectorAll(".cart-count").forEach((badge) => {
      badge.textContent = String(total);
      badge.setAttribute("aria-label", `${total} article${total > 1 ? "s" : ""}`);
    });
  } catch {
    // Le panier reste à zéro si le stockage local est indisponible.
  }

  document.querySelectorAll("details.nav-dropdown").forEach((dropdown) => {
    const summary = dropdown.querySelector(":scope > summary");
    if (!summary || !summary.textContent.trim().startsWith("Publications")) return;

    summary.innerHTML = '<a class="nav-hub-link" href="/publications/">Publications</a><span aria-hidden="true">⌄</span>';
    summary.querySelector(".nav-hub-link")?.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  });

  document.querySelectorAll(".menu-button").forEach((button, index) => {
    const header = button.closest(".site-header");
    const mainNav = header?.querySelector(".main-nav");
    const desktopMenu = header?.querySelector(".desktop-menu");
    if (!header || !mainNav || !desktopMenu) return;

    const mobileMenu = document.createElement("nav");
    mobileMenu.className = "mobile-menu wrap";
    mobileMenu.id = `mobile-menu-${index + 1}`;
    mobileMenu.setAttribute("aria-label", "Navigation mobile");
    mobileMenu.hidden = true;
    mobileMenu.innerHTML = desktopMenu.innerHTML;
    mainNav.insertAdjacentElement("afterend", mobileMenu);

    button.setAttribute("aria-controls", mobileMenu.id);
    button.setAttribute("aria-expanded", "false");

    const closeMenu = () => {
      mobileMenu.hidden = true;
      button.setAttribute("aria-expanded", "false");
      button.textContent = "☰";
    };

    button.addEventListener("click", () => {
      const willOpen = mobileMenu.hidden;
      mobileMenu.hidden = !willOpen;
      button.setAttribute("aria-expanded", String(willOpen));
      button.textContent = willOpen ? "×" : "☰";
    });

    mobileMenu.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !mobileMenu.hidden) {
        closeMenu();
        button.focus();
      }
    });
  });

  document.querySelectorAll("[data-search-toggle]").forEach((button) => {
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    if (!panel) return;

    const closeSearch = () => {
      panel.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
      window.setTimeout(() => {
        if (!panel.classList.contains("is-open")) panel.hidden = true;
      }, 220);
    };

    button.addEventListener("click", () => {
      if (panel.classList.contains("is-open")) {
        closeSearch();
        return;
      }

      panel.hidden = false;
      window.requestAnimationFrame(() => {
        panel.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
        panel.querySelector("input")?.focus();
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && panel.classList.contains("is-open")) {
        closeSearch();
        button.focus();
      }
    });
  });

  document.querySelectorAll("[data-like-button]").forEach((button) => {
    button.addEventListener("click", () => {
      const liked = button.getAttribute("aria-pressed") === "true";
      if (liked) return;
      const count = button.querySelector("[data-like-count]");
      const nextCount = Number(count?.textContent || 0) + 1;
      button.setAttribute("aria-pressed", "true");
      button.classList.add("is-liked");
      if (count) count.textContent = String(nextCount);
    });
  });

  document.querySelectorAll("[data-video-filters]").forEach((filters) => {
    const cards = document.querySelectorAll("[data-video-category]");
    filters.querySelectorAll("button[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        const selected = button.dataset.filter;
        filters.querySelectorAll("button[data-filter]").forEach((item) => {
          const active = item === button;
          item.classList.toggle("active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        cards.forEach((card) => {
          card.hidden = selected !== "all" && card.dataset.videoCategory !== selected;
        });
      });
    });
  });

  document.querySelectorAll("[data-podcast-filters]").forEach((filters) => {
    const cards = document.querySelectorAll("[data-podcast-category]");
    filters.querySelectorAll("button[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        const selected = button.dataset.filter;
        filters.querySelectorAll("button[data-filter]").forEach((item) => {
          const active = item === button;
          item.classList.toggle("active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        cards.forEach((card) => {
          card.hidden = selected !== "all" && card.dataset.podcastCategory !== selected;
        });
      });
    });
  });

  document.querySelectorAll("[data-share-root]").forEach((root) => {
    const title = root.dataset.shareTitle || document.title;
    const url = root.dataset.shareUrl || window.location.href;
    const message = root.dataset.shareMessage || `${title} — ${url}`;
    const feedback = root.querySelector("[data-share-feedback]");
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedMessage = encodeURIComponent(message);
    const shareIcons = {
      whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="filled" d="M12 2a9.6 9.6 0 0 0-8.2 14.6L2.5 21.5l5-1.3A9.7 9.7 0 1 0 12 2Zm0 17.4c-1.5 0-2.9-.4-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A7.7 7.7 0 1 1 12 19.4Zm4.2-5.7c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-1.4-.7-2.4-1.3-3.3-2.9-.2-.3.2-.3.7-1.1.1-.2 0-.4 0-.5l-.7-1.7c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 5 4.2 1.8.8 2.5.8 3.4.7.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .2-1.1-.1-.1-.3-.2-.5-.3Z"/></svg>',
      telegram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="filled" d="M21.5 3.3 18.3 20c-.2 1.2-.9 1.5-1.8.9l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L5.8 13.8 1 12.3c-1-.3-1.1-1 .2-1.5L20 3.5c.9-.3 1.7.2 1.5-.2Z"/></svg>',
      x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="filled" d="M18.9 2H22l-6.8 7.8L23.2 22H17l-4.9-6.4L6.5 22H3.4l7.2-8.2L2.9 2h6.3l4.4 5.8L18.9 2Zm-1.1 17.9h1.7L8.3 4H6.5l11.3 15.9Z"/></svg>',
      facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="filled" d="M13.8 22v-9h3l.5-3.5h-3.5V7.3c0-1 .3-1.7 1.8-1.7h1.9V2.5c-.3 0-1.5-.1-2.8-.1-2.8 0-4.7 1.7-4.7 4.8v2.3H7V13h3v9h3.8Z"/></svg>',
      linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="filled" d="M5.3 7.8H2.1V22h3.2V7.8ZM3.7 2A1.9 1.9 0 1 0 3.7 5.8 1.9 1.9 0 0 0 3.7 2ZM22 13.8c0-4.3-2.3-6.3-5.4-6.3-2.5 0-3.6 1.4-4.2 2.3v-2H9.2V22h3.2v-7c0-1.8.4-3.6 2.7-3.6 2.3 0 2.3 2.1 2.3 3.7V22H22v-8.2Z"/></svg>',
      email: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="2"></rect><path d="m3.5 6 8.5 7 8.5-7"></path></svg>',
      sms: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4.5h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10l-5.5 3v-3H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z"></path><circle cx="8" cy="11" r=".7" class="filled"></circle><circle cx="12" cy="11" r=".7" class="filled"></circle><circle cx="16" cy="11" r=".7" class="filled"></circle></svg>',
      native: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5"></circle><circle cx="6" cy="12" r="2.5"></circle><circle cx="18" cy="19" r="2.5"></circle><path d="m8.2 10.8 7.5-4.4M8.2 13.2l7.5 4.4"></path></svg>',
      copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"></rect><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"></path></svg>'
    };
    const shareLabels = { whatsapp: "Partager sur WhatsApp", telegram: "Partager sur Telegram", x: "Partager sur X", facebook: "Partager sur Facebook", linkedin: "Partager sur LinkedIn", email: "Partager par e-mail", sms: "Partager par SMS", native: "Partager l’audio", copy: "Copier le lien" };

    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodedMessage}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      x: `https://twitter.com/intent/tweet?text=${encodedMessage}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedMessage}`,
      sms: `sms:?body=${encodedMessage}`
    };

    root.querySelectorAll("[data-share-platform]").forEach((button) => {
      const icon = shareIcons[button.dataset.sharePlatform];
      if (icon) button.innerHTML = button.dataset.shareLabel ? `${icon}<span>${button.dataset.shareLabel}</span>` : icon;
      if (!button.getAttribute("aria-label")) button.setAttribute("aria-label", shareLabels[button.dataset.sharePlatform] || "Partager");
      button.addEventListener("click", async () => {
        const platform = button.dataset.sharePlatform;
        if (platform === "native") {
          if (navigator.share) {
            try {
              await navigator.share({ title, text: message, url });
              if (feedback) feedback.textContent = "Audio partagé.";
            } catch (error) {
              if (error?.name !== "AbortError" && feedback) feedback.textContent = "Partage annulé.";
            }
          } else {
            try {
              await navigator.clipboard.writeText(message);
              if (feedback) feedback.textContent = "Lien prêt à partager.";
            } catch {
              if (feedback) feedback.textContent = url;
            }
          }
          return;
        }
        if (platform === "copy") {
          try {
            await navigator.clipboard.writeText(url);
            if (feedback) feedback.textContent = "Lien copié.";
          } catch {
            if (feedback) feedback.textContent = url;
          }
          return;
        }
        const target = shareUrls[platform];
        if (!target) return;
        if (platform === "email" || platform === "sms") window.location.href = target;
        else window.open(target, "_blank", "noopener,noreferrer,width=720,height=620");
      });
    });
  });
});
