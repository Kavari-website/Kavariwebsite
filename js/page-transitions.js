/**
 * page-transitions.js — Transiciones suaves y rápidas entre páginas de KAVARI
 * Overlay con barra de progreso + logo, navegación y fade-in al llegar.
 */
(function () {
  'use strict';

  var prefersReduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var overlay = null;
  var transitioning = false;

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
    }, 300);
  }

  function revealPage() {
    document.body.classList.add('page-loaded');
    hideOverlay();
  }

  function isInternalSibling(href) {
    if (/^(#|mailto:|tel:|javascript:|\/\/)/i.test(href)) return false;
    try {
      var url = new URL(href, window.location.href);
      return url.origin === window.location.origin && /\.html($|\?|$)/.test(url.pathname);
    } catch (_) {
      return false;
    }
  }

  function navigate(href) {
    if (transitioning) return;
    transitioning = true;

    document.body.style.opacity = '0';
    document.body.style.transform = 'translateY(-4px)';

    showOverlay();

    setTimeout(function () {
      window.location.href = href;
    }, 280);
  }

  window.kavariNavigate = function (href) {
    if (!href) return;
    if (prefersReduced) { window.location.href = href; return; }
    navigate(href);
  };

  function bindClicks() {
    document.addEventListener('click', function (e) {
      if (prefersReduced || transitioning) return;
      var anchor = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== '_self') return;
      var href = anchor.getAttribute('href') || '';
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
