/* ==========================================================================
 * KAVARI · mobile-nav.js
 * --------------------------------------------------------------------------
 * Mejora el menú móvil de la barra de navegación unificada (.nav-glass):
 *  - Bloquea el scroll del body mientras el menú está abierto
 *  - Cierra el menú al pulsar un enlace o la tecla Escape
 *  - Anima la hamburguesa (X) y sincroniza estados ARIA
 *
 * No sustituye el onclick inline existente: observa la clase .open
 * y reacciona a ella. Es seguro cargarlo en todas las páginas.
 * ========================================================================== */
(function () {
  'use strict';

  var navLinks = document.getElementById('navLinks');
  var burger = document.getElementById('hamburger');

  // La página de Destino usa su propio drawer móvil (toggleMobileDrawer)
  if (!navLinks || !burger) return;

  var body = document.body;
  var mobileMedia = window.matchMedia ? window.matchMedia('(max-width: 900px)') : null;

  function syncMenu() {
    var open = navLinks.classList.contains('open');

    burger.classList.toggle('active', open);
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');

    // Solo gestionamos aria-hidden cuando el menú de navegación es móvil;
    // en escritorio el nav es visible y no debe marcarse como oculto.
    if (mobileMedia && mobileMedia.matches) {
      navLinks.setAttribute('aria-hidden', open ? 'false' : 'true');
    } else {
      navLinks.removeAttribute('aria-hidden');
    }
  }

  // Observa cambios en la clase del menú (el onclick inline alterna .open)
  if (window.MutationObserver) {
    var observer = new MutationObserver(syncMenu);
    observer.observe(navLinks, { attributes: true, attributeFilter: ['class'] });
  }

  burger.addEventListener('click', function () {
    // El onclick inline ya alternó la clase; sincronizamos tras el cambio
    requestAnimationFrame(syncMenu);
  });

  // Cierra el menú al pulsar cualquier enlace
  Array.prototype.forEach.call(navLinks.querySelectorAll('a'), function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      syncMenu();
    });
  });

  // Cierra con Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      syncMenu();
    }
  });

  // Estado inicial por si se recarga con el menú abierto
  syncMenu();

  // Al pasar de móvil a escritorio (o viceversa), re-sincroniza el estado
  if (mobileMedia && mobileMedia.addEventListener) {
    mobileMedia.addEventListener('change', syncMenu);
  }
})();
