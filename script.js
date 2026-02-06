/* =========================================================
   Pediatria Intensiva - JS (leve, sem dependências)
   Funcionalidades:
   - Menu mobile: abrir e fechar (drawer)
   - Smooth scroll para âncoras
   - Accordion acessível com ARIA + animação
   - IntersectionObserver para revelar seções/cards
   - Botão voltar ao topo (após scroll)
   - Botão flutuante WhatsApp (já no HTML)
   - Toggle dark mode com persistência em localStorage
   ========================================================= */

(function () {
  "use strict";

  // Helpers
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---------------------------
  // Theme toggle (dark mode)
  // ---------------------------
  const THEME_KEY = "pediatria-theme";
  const themeToggle = $("[data-theme-toggle]");

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;

    // Preferência do sistema
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  }

  applyTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "light";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    });
  }

  // ---------------------------
  // Mobile drawer menu
  // ---------------------------
  const menuButton = $("[data-menu-button]");
  const menuDrawer = $("[data-menu-drawer]");
  const menuCloseButtons = $$("[data-menu-close]");
  const drawerLinks = $$("[data-drawer-link]");
  let lastFocusedElement = null;

  function openDrawer() {
    if (!menuDrawer || !menuButton) return;
    lastFocusedElement = document.activeElement;

    menuDrawer.classList.add("is-open");
    menuDrawer.setAttribute("aria-hidden", "false");
    menuButton.setAttribute("aria-expanded", "true");

    // Foco: primeiro link do drawer
    const firstLink = $(".drawer__link", menuDrawer);
    if (firstLink) firstLink.focus();

    // Evitar scroll do body
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    if (!menuDrawer || !menuButton) return;

    menuDrawer.classList.remove("is-open");
    menuDrawer.setAttribute("aria-hidden", "true");
    menuButton.setAttribute("aria-expanded", "false");

    document.body.style.overflow = "";

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  if (menuButton) {
    menuButton.addEventListener("click", () => {
      const isOpen = menuDrawer && menuDrawer.classList.contains("is-open");
      isOpen ? closeDrawer() : openDrawer();
    });
  }

  menuCloseButtons.forEach((btn) => btn.addEventListener("click", closeDrawer));
  drawerLinks.forEach((a) => a.addEventListener("click", closeDrawer));

  // ESC fecha o drawer
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuDrawer && menuDrawer.classList.contains("is-open")) {
      closeDrawer();
    }
  });

  // Clique fora: já tem backdrop com data-menu-close, mas garante robustez
  if (menuDrawer) {
    menuDrawer.addEventListener("click", (e) => {
      const target = e.target;
      if (target && target.matches && target.matches(".drawer__backdrop")) {
        closeDrawer();
      }
    });
  }

  // ---------------------------
  // Smooth scroll
  // ---------------------------
  function smoothScrollTo(hash) {
    const id = hash.replace("#", "");
    const el = document.getElementById(id);
    if (!el) return;

    // Header sticky offset
    const header = $("[data-header]");
    const headerH = header ? header.getBoundingClientRect().height : 0;
    const top = window.scrollY + el.getBoundingClientRect().top - (headerH + 12);

    window.scrollTo({ top, behavior: "smooth" });
  }

  // Links com âncora
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href || href.length < 2) return;

    e.preventDefault();
    smoothScrollTo(href);
  });

  // Elementos com data-scroll (reforço)
  $$("[data-scroll]").forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      e.preventDefault();
      smoothScrollTo(href);
    });
  });

  // ---------------------------
  // Accordion acessível + animação
  // ---------------------------
  const accordions = $$("[data-accordion]");

  function setPanelHeight(panel, isOpen) {
    // Animação suave via max-height (JS calcula altura)
    // Mantém simples, leve e sem layout thrash excessivo
    panel.style.overflow = "hidden";
    panel.style.transition = "max-height 220ms ease";
    panel.style.maxHeight = isOpen ? panel.scrollHeight + "px" : "0px";
  }

  accordions.forEach((acc) => {
    const items = $$(".accordion__item", acc);

    items.forEach((item) => {
      const trigger = $(".accordion__trigger", item);
      const panel = $(".accordion__panel", item);

      if (!trigger || !panel) return;

      // Estado inicial
      trigger.setAttribute("aria-expanded", "false");
      panel.hidden = true;
      panel.style.maxHeight = "0px";

      trigger.addEventListener("click", () => {
        const expanded = trigger.getAttribute("aria-expanded") === "true";
        const next = !expanded;

        // Toggle
        trigger.setAttribute("aria-expanded", String(next));
        item.classList.toggle("is-open", next);
        panel.hidden = false; // necessário para medir scrollHeight

        setPanelHeight(panel, next);

        if (!next) {
          // espera a animação e volta hidden
          window.setTimeout(() => {
            panel.hidden = true;
          }, 230);
        }
      });

      // Teclado: Enter/Space já funcionam em button
    });
  });

  // ---------------------------
  // IntersectionObserver: reveal
  // ---------------------------
  const revealEls = $$(".reveal");

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealEls.forEach((el) => io.observe(el));
  } else {
    // Fallback simples
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // ---------------------------
  // Back to top button
  // ---------------------------
  const backToTop = $("[data-back-to-top]");

  function handleScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;

    if (backToTop) {
      if (y > 650) backToTop.classList.add("is-visible");
      else backToTop.classList.remove("is-visible");
    }
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  if (backToTop) {
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
})();
