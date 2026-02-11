/* =========================================================
   Pediatria Intensiva - JS (leve, sem dependências)
   Atualização: menu/header removidos do projeto
   Mantido:
   - Smooth scroll para âncoras
   - Accordion acessível com ARIA + animação
   - IntersectionObserver para reveal
   - Botão voltar ao topo
   - Dark mode automático/persistido (sem botão na UI)
   ========================================================= */

(function () {
  "use strict";

  // Helpers
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---------------------------
  // Theme (dark mode) com persistência
  // Observação: o botão de toggle foi removido junto com o header.
  // Continua aplicando:
  // - valor salvo no localStorage, se existir
  // - senão, preferência do sistema
  // ---------------------------
  const THEME_KEY = "pediatria-theme";

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;

    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  }

  applyTheme(getPreferredTheme());

  // ---------------------------
  // Smooth scroll (sem offset de header)
  // ---------------------------
  function smoothScrollTo(hash) {
    const id = hash.replace("#", "");
    const el = document.getElementById(id);
    if (!el) return;

    const top = window.scrollY + el.getBoundingClientRect().top - 12;
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

        trigger.setAttribute("aria-expanded", String(next));
        item.classList.toggle("is-open", next);

        panel.hidden = false; // necessário para medir
        setPanelHeight(panel, next);

        if (!next) {
          window.setTimeout(() => {
            panel.hidden = true;
          }, 230);
        }
      });
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