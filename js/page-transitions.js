/**
 * page-transitions.js — Transiciones entre páginas de KAVARI
 * Desvanece la página actual y muestra un overlay con el logo mientras
 * carga la siguiente. Expone window.kavariNavigate(href) para que las
 * navegaciones programáticas (p.ej. irAPais) usen la misma transición.
 */
(function () {
  'use strict';

  const prefersReduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let overlay = null;
  let transitioning = false;

  function buildOverlay() {
    if (document.getElementById('kavariPageTrans')) {
      overlay = document.getElementById('kavariPageTrans');
      return;
    }
    overlay = document.createElement('div');
    overlay.id = 'kavariPageTrans';
    overlay.className = 'kavari-page-trans';
    overlay.innerHTML =
      '<div class="kpt-inner">' +
        '<div class="kpt-logo">K<span>AVARI</span></div>' +
        '<div class="kpt-ring" aria-hidden="true"></div>' +
      '</div>';
    document.body.appendChild(overlay);
  }

  function showOverlay() {
    if (!overlay) buildOverlay();
    requestAnimationFrame(function () {
      overlay.classList.add('kpt-shown');
    });
  }

  function revealPage() {
    document.body.classList.add('page-loaded');
  }

  function isInternalSibling(href) {
    if (/^(#|mailto:|tel:|javascript:|\/\/)/i.test(href)) return false;
    try {
      const url = new URL(href, window.location.href);
      return url.origin === window.location.origin && /\.html($|\?|$)/.test(url.pathname);
    } catch (_) {
      return false;
    }
  }

  function navigate(href) {
    if (transitioning) return;
    transitioning = true;
    document.body.classList.remove('page-loaded');
    showOverlay();
    setTimeout(function () {
      window.location.href = href;
    }, 420);
  }

  /* Navegación programática con la misma transición */
  window.kavariNavigate = function (href) {
    if (!href) return;
    if (prefersReduced) { window.location.href = href; return; }
    navigate(href);
  };

  function bindClicks() {
    document.addEventListener('click', function (e) {
      if (prefersReduced || transitioning) return;
      const anchor = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== '_self') return;
      const href = anchor.getAttribute('href') || '';
      if (anchor.hasAttribute('download')) return;
      if (anchor.hasAttribute('data-guide-register')) return;
      if (anchor.dataset.navegable === 'false') return;
      if (!isInternalSibling(href)) return;
      if (e.defaultPrevented) return;

      e.preventDefault();
      navigate(href);
    });
  }

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        revealPage();
        bindClicks();
      });
    } else {
      revealPage();
      bindClicks();
    }
  }

  init();
})();