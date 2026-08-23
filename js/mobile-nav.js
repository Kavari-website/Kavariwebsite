/* ==========================================================================
 * KAVARI · mobile-nav.js (v3)
 * --------------------------------------------------------------------------
 * Control ÚNICO del menú móvil de la barra unificada (.nav-glass):
 *  - Alterna .open en el menú y .active en la hamburguesa al pulsar
 *  - Bloquea el scroll del body mientras el menú está abierto
 *  - Cierra al pulsar un enlace, la tecla Escape o fuera del menú
 *  - Sincroniza estados ARIA y re-sincroniza al cruzar el breakpoint
 *
 * Idempotente: elimina cualquier onclick inline previo de #hamburger
 * para evitar dobles alternancias. Seguro en todas las páginas.
 * ========================================================================== */
(function () {
  'use strict';

  function init() {
    var navLinks = document.getElementById('navLinks');
    var burger = document.getElementById('hamburger');
    // La página de Destino usa su propio drawer móvil
    if (!navLinks || !burger) return;

    var body = document.body;
    var mobileMedia = window.matchMedia ? window.matchMedia('(max-width: 900px)') : null;

    // Evita doble toggle: el onclick inline (si existiera) ya no actúa
    burger.removeAttribute('onclick');
    burger.onclick = null;

    function isOpen() { return navLinks.classList.contains('open'); }

    function syncMenu() {
      var open = isOpen();
      burger.classList.toggle('active', open);
      body.classList.toggle('menu-open', open);
      // Compatibilidad con CSS antiguos que revelan con .open.open-active
      navLinks.classList.toggle('open-active', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');

      if (mobileMedia && mobileMedia.matches) {
        navLinks.setAttribute('aria-hidden', open ? 'false' : 'true');
      } else {
        navLinks.removeAttribute('aria-hidden');
      }
    }

    function toggleMenu(force) {
      var abrir = typeof force === 'boolean' ? force : !isOpen();
      navLinks.classList.toggle('open', abrir);
      syncMenu();
    }

    // Toggle principal desde la hamburguesa
    burger.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });

    // Cerrar al pulsar cualquier enlace del menú
    Array.prototype.forEach.call(navLinks.querySelectorAll('a'), function (link) {
      link.addEventListener('click', function () { toggleMenu(false); });
    });

    // Cerrar con Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) toggleMenu(false);
    });

    // Cerrar al tocar fuera (solo móvil)
    document.addEventListener('click', function (e) {
      if (!isOpen()) return;
      if (!mobileMedia || !mobileMedia.matches) return;
      if (navLinks.contains(e.target) || burger.contains(e.target)) return;
      toggleMenu(false);
    });

    // Observador de seguridad: refleja cambios externos de la clase .open
    if (window.MutationObserver) {
      new MutationObserver(syncMenu).observe(navLinks, {
        attributes: true,
        attributeFilter: ['class']
      });
    }

    // Re-sincroniza al cruzar el breakpoint móvil/escritorio
    if (mobileMedia && mobileMedia.addEventListener) {
      mobileMedia.addEventListener('change', function () {
        if (!mobileMedia.matches) toggleMenu(false); // llegó a escritorio: cerrar
        else syncMenu();
      });
    }

    syncMenu(); // estado inicial (por si se recarga con menú abierto)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
