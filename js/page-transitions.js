/**
 * page-transitions.js — Transiciones suaves entre páginas de KAVARI
 * Funde la página actual, muestra overlay con barra de progreso y logo,
 * luego navega. Al llegar, la nueva página aparece con fade-in + slide-up.
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
      overlay.classList.remove('kpt-leaving');
      overlay.classList.add('kpt-shown');
    });
  }

  function hideOverlay(callback) {
    if (!overlay) { if (callback) callback(); return; }
    overlay.classList.add('kpt-leaving');
    overlay.classList.remove('kpt-shown');
    setTimeout(function () {
      overlay.classList.remove('kpt-leaving');
      if (callback) callback();
    }, 400);
  }

  function revealPage() {
    document.body.classList.add('page-loaded');
    hideOverlay();
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

    // Funde suavemente el contenido actual
    document.body.style.opacity = '0';
    document.body.style.transform = 'translateY(-6px)';

    setTimeout(function () {
      showOverlay();
      // Navega después de que el overlay sea visible
      setTimeout(function () {
        window.location.href = href;
      }, 500);
    }, 350);
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

    // Al volver atrás/adelante con el botón del navegador
    window.addEventListener('pageshow', function (event) {
      if (event.persisted) {
        transitioning = false;
        document.body.style.opacity = '';
        document.body.style.transform = '';
        revealPage();
      }
    });
  }

  init();
})();