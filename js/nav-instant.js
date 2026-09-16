/**
 * nav-instant.js — Navegación instantánea entre páginas de KAVARI (sin recarga)
 * ==========================================================================
 * Sustituye la navegación clásica (recarga completa) por una navegación suave:
 *  1) Intercepta los clics en enlaces internos (.html del mismo sitio).
 *  2) Descarga la página destino con fetch (primera vez) o desde una caché en
 *     memoria (visitas siguientes: cambio instantáneo, sin red).
 *  3) Reemplaza el documento actual con el HTML de la página destino.
 *     document.open()/write()/close() recrean el documento fresco igual que
 *     un load real: cada página vuelve a ejecutar sus propios scripts (idioma,
 *     tema, formularios, chatbot…) con su estado correcto, pero SIN recargar
 *     CSS, imágenes ni scripts que ya estaban en caché.
 *  4) Actualiza la URL con history.pushState(); el botón "atrás" y las
 *     páginas de destino funcionan igual que antes (popstate).
 *
 * Si algo falla, se degrada a la navegación normal (window.location.href).
 * ==========================================================================
 */
(function () {
  'use strict';

  if (window.__navInstantActive) return;
  window.__navInstantActive = true;

  var busy = false;
  var cacheHtml = {};
  var soportado = false;

  try {
    soportado = typeof document.open === 'function' &&
                typeof document.write === 'function' &&
                typeof document.close === 'function';
  } catch (e) {
    soportado = false;
  }

  // ===== Detección de enlaces internos (.html del mismo sitio) =====
  function esPaginaInterna(href) {
    if (!href || typeof href !== 'string') return false;
    if (/^(#|mailto:|tel:|javascript:|\/\/)/i.test(href)) return false;
    if (/\.(png|jpe?g|gif|svg|webp|mp4|webm|js|css|json|pdf|ico|txt|woff2?)$/i.test(href)) return false;
    try {
      var u = new URL(href, window.location.href);
      if (u.origin !== window.location.origin) return false;
      var p = u.pathname;
      if (p === '/' || /\/$/.test(p)) return true; // índice de raíz
      return /\.html($|\?|#)/i.test(p);
    } catch (_) {
      return false;
    }
  }

  function mismaUrl(u) {
    try {
      var actual = new URL(window.location.href);
      return u.origin === actual.origin &&
             u.pathname === actual.pathname &&
             (u.search || '') === (actual.search || '');
    } catch (e) {
      return false;
    }
  }

  function desplazamiento(url) {
    if (url.hash) {
      var objetivo = document.getElementById(url.hash.slice(1));
      if (objetivo && objetivo.scrollIntoView) {
        objetivo.scrollIntoView({ block: 'start', behavior: 'auto' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }

  // ===== Descarga con caché en memoria =====
  function obtenerHTML(u, ok, falla) {
    var href = u.href;
    if (cacheHtml[href]) { ok(cacheHtml[href]); return; }
    fetch(href, {
      credentials: 'include',
      cache: 'default',
      headers: { 'X-KAVARI-NAV': '1' }
    })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then(function (html) {
        if (!/<(html|body)[\s>]/i.test(html.slice(0, 400))) {
          throw new Error('contenido-no-html');
        }
        cacheHtml[href] = html;
        ok(html);
      })
      .catch(function (err) { falla(err); });
  }

  // ===== Navegación suave =====
  function navegarSuave(u, mantenerEntrada) {
    if (!soportado || busy || !u) return false;
    busy = true;

    obtenerHTML(u, function (html) {
      try {
        if (!mantenerEntrada && !mismaUrl(u)) {
          history.pushState({ kavariNav: u.href }, '', u.pathname + u.search + u.hash);
        }
        document.open();
        document.write(html);
        document.close();
        desplazamiento(u);
        busy = false;
        return;
      } catch (err) {
        try { window.location.href = u.href; } catch (e) {}
        busy = false;
        return;
      }
    }, function () {
      busy = false;
      try {
        if (mantenerEntrada) { window.location.reload(); }
        else { window.location.href = u.href; }
      } catch (e) {
        try { window.location.href = u.href; } catch (e2) {}
      }
    });
    return true;
  }

  function irA(href) {
    if (!href) return;
    var u = new URL(href, window.location.href);
    if (!esPaginaInterna(u.href)) {
      window.location.href = href;
      return;
    }
    if (mismaUrl(u)) {
      desplazamiento(u);
      return;
    }
    navegarSuave(u, false);
  }

  window.kavariInstantGo = irA;

  // Navegación programática (usada por index/paises/perfil)
  window.kavariNavigate = function (href) {
    if (window.__navInstantActive && window.kavariInstantGo) {
      window.kavariInstantGo(href);
    } else if (window.location) {
      window.location.href = href;
    }
  };

  // ===== Botón atrás / adelante =====
  window.addEventListener('popstate', function () {
    if (!soportado || busy) return;
    var u = new URL(window.location.href);
    if (esPaginaInterna(u.href)) {
      navegarSuave(u, true);
    }
  });

  // ===== Interceptar clics en enlaces internos =====
  document.addEventListener('click', function (e) {
    if (!soportado) return;
    if (e.defaultPrevented) return;
    if (e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var enlace = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!enlace) return;
    if (enlace.target && enlace.target !== '_self') return;
    if (enlace.hasAttribute('download')) return;
    if (enlace.hasAttribute('data-guide-register')) return;
    if (enlace.dataset && enlace.dataset.navegable === 'false') return;

    var href = enlace.getAttribute('href') || '';
    if (!esPaginaInterna(href)) return;
    if (busy) return; // navegación normal si ya hay una en curso

    e.preventDefault();
    irA(href);
  }, true);

  // ===== Prefetch en segundo plano (primera visita instantánea) =====
  var PREFETCH = [
    'index.html', 'paises.html', 'sobrenosotros.html', 'ayuda.html',
    'contacto.html', 'planes.html', 'cuenta.html', 'perfil.html',
    'privacidad.html', 'terminos.html', 'destino.html', 'data/data.json'
  ];

  function prefetchEnIdle() {
    try {
      var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn && conn.saveData) return;
    } catch (e) {}

    var hecho = false;
    try { hecho = sessionStorage.getItem('kavari-prefetch') === '1'; } catch (e) {}
    if (hecho) return;

    var base = window.location.href.split(/[?#]/)[0];
    var i = 0;

    function siguiente() {
      if (i >= PREFETCH.length) {
        try { sessionStorage.setItem('kavari-prefetch', '1'); } catch (e) {}
        return;
      }
      var u = new URL(PREFETCH[i], base);
      i++;
      obtenerHTML(u, siguiente, siguiente); // almacena en cacheHtml y continúa
    }

    // Prefetch seriado para no saturar la red en la carga inicial
    if (window.requestIdleCallback) {
      window.requestIdleCallback(siguiente, { timeout: 3500 });
    } else {
      window.setTimeout(siguiente, 800);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', prefetchEnIdle);
  } else {
    window.setTimeout(prefetchEnIdle, 400);
  }
})();