/**
 * scroll-lock.js — Bloquea el scroll del fondo cuando hay una ventana/modal abierta.
 *
 * Uso:
 *   KavariScrollLock.lock();   // al abrir la ventana
 *   KavariScrollLock.unlock(); // al cerrarla
 *
 * - Soporta ventanas apiladas: el scroll solo se libera al cerrar la última.
 * - Compensa el ancho de la barra de scroll para que la página no "salte".
 * - Bloquea el "scroll chaining": hacer scroll dentro del modal nunca mueve
 *   el fondo (ratón, trackpad y táctil), aunque el contenido del modal se acabe.
 */
(function () {
  'use strict';

  var depth = 0;
  var prevBodyOverflow = '';
  var prevHtmlOverflow = '';
  var listening = false;

  /* ─── Estilos: bloqueo duro de html/body + sin encadenamiento ─── */
  var css = ''
    + 'html.kv-locked,body.kv-locked{overflow:hidden !important;}'
    + 'body.kv-locked{overscroll-behavior:none !important;touch-action:none !important;}'
    + 'body.kv-locked .modal-overlay,body.kv-locked .modal-overlay-souvenirs,'
    + 'body.kv-locked .top10-modal-overlay,body.kv-locked .paquete-modal-overlay,'
    + 'body.kv-locked .traveler-modal,body.kv-locked .gsi-overlay'
    + '{touch-action:auto;overscroll-behavior:contain;}';

  function injectStyles() {
    if (document.getElementById('kv-scroll-lock-style')) return;
    var s = document.createElement('style');
    s.id = 'kv-scroll-lock-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function scrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
  }

  /* ─── Intercepción de eventos mientras hay un modal abierto ─── */

  // Devuelve el ancestro más cercano con scroll propio real (excluye body/html).
  function nearestScrollable(el) {
    while (el && el !== document.body && el !== document.documentElement) {
      if (el.nodeType === 1) {
        var oy = window.getComputedStyle(el).overflowY;
        if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight) {
          return el;
        }
      }
      el = el.parentElement;
    }
    return null;
  }

  function canScrollMore(el, delta) {
    // delta > 0 = hacia abajo
    if (delta > 0) return el.scrollTop + el.clientHeight < el.scrollHeight - 1;
    return el.scrollTop > 1;
  }

  function onWheel(e) {
    var sc = nearestScrollable(e.target);
    // Si el puntero NO está sobre un área con scroll propio, o ya llegó a su
    // extremo en esta dirección, cancelamos el evento para que el fondo no se mueva.
    if (!sc || !canScrollMore(sc, e.deltaY)) {
      e.preventDefault();
    }
  }

  function onTouchMove(e) {
    var sc = nearestScrollable(e.target);
    if (!sc) e.preventDefault();
  }

  function startListening() {
    if (listening) return;
    listening = true;
    document.addEventListener('wheel', onWheel, { capture: true, passive: false });
    document.addEventListener('touchmove', onTouchMove, { capture: true, passive: false });
  }

  function stopListening() {
    if (!listening) return;
    listening = false;
    document.removeEventListener('wheel', onWheel, { capture: true });
    document.removeEventListener('touchmove', onTouchMove, { capture: true });
  }

  /* ─── API ─── */

  function lock() {
    depth += 1;
    if (depth > 1) return;
    injectStyles();
    var sw = scrollbarWidth();
    prevBodyOverflow = document.body.style.overflow || '';
    prevHtmlOverflow = document.documentElement.style.overflow || '';
    document.body.classList.add('kv-locked');
    document.documentElement.classList.add('kv-locked');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (sw > 0) document.body.style.paddingRight = sw + 'px';
    startListening();
  }

  function unlock() {
    if (depth === 0) return;
    depth -= 1;
    if (depth > 0) return;
    stopListening();
    document.body.classList.remove('kv-locked');
    document.documentElement.classList.remove('kv-locked');
    document.body.style.overflow = prevBodyOverflow;
    document.documentElement.style.overflow = prevHtmlOverflow;
    document.body.style.paddingRight = '';
  }

  window.KavariScrollLock = { lock: lock, unlock: unlock };
})();
