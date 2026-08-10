/* KAVARI · Fallback global de imágenes rotas (red de seguridad)
 * -------------------------------------------------------------
 * Si cualquier <img> de la página no puede cargarse (archivo 404,
 * imagen externa bloqueada por CORS/CORB, error de red, etc.), esta
 * red de seguridad la sustituye por un placeholder SVG con la
 * identidad de KAVARI, usando el texto alternativo como etiqueta.
 *
 * Funciona por delegación de eventos, así que también cubre imágenes
 * añadidas dinámicamente (destino.js, chatbot, etc.).
 */
(function () {
  'use strict';
  if (window.__kavariImgFallback) return;
  window.__kavariImgFallback = true;

  function escXml(s) {
    return String(s).replace(/[<>&'"]/g, c => ({
      '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&#39;', '"': '&quot;',
    })[c]);
  }

  function svgFor(label) {
    var name = String(label || 'KAVARI').trim().split(/\s+/).filter(Boolean).join(' ').slice(0, 26) || 'KAVARI';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">'
      + '<defs>'
      + '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#163b80"/><stop offset="1" stop-color="#0d1f3c"/></linearGradient>'
      + '<radialGradient id="r" cx="0.5" cy="0.35" r="0.75"><stop offset="0" stop-color="#00c2a8" stop-opacity="0.30"/><stop offset="1" stop-color="#00c2a8" stop-opacity="0"/></radialGradient>'
      + '</defs>'
      + '<rect width="800" height="600" fill="url(#g)"/><rect width="800" height="600" fill="url(#r)"/>'
      + '<circle cx="110" cy="110" r="170" fill="none" stroke="#ffffff" stroke-opacity="0.07" stroke-width="2"/>'
      + '<circle cx="700" cy="500" r="210" fill="none" stroke="#00c2a8" stroke-opacity="0.14" stroke-width="2"/>'
      + '<text x="400" y="300" text-anchor="middle" font-family="Arial, sans-serif" font-size="72" fill="#ffffff" fill-opacity="0.92">&#9992;</text>'
      + '<text x="400" y="384" text-anchor="middle" font-family="\'Segoe UI\', Arial, sans-serif" font-weight="700" font-size="44" fill="#ffffff">' + escXml(name) + '</text>'
      + '<text x="400" y="556" text-anchor="middle" font-family="\'Segoe UI\', Arial, sans-serif" font-weight="600" font-size="22" letter-spacing="12" fill="#ffffff" fill-opacity="0.5">KAVARI</text>'
      + '</svg>';
  }

  function applyFallback(img) {
    if (!img || img.tagName !== 'IMG' || img.dataset.kavariFallback) return;
    // El avatar del navbar tiene su propio fallback (iniciales); no lo pisamos.
    if (img.dataset.kavariNoFallback === '1') return;
    img.dataset.kavariFallback = '1';
    // Quitar el onerror inline (p. ej. los de destino.js que apuntan a Unsplash):
    // este handler de captura corre ANTES que ellos, y sin esto podrían pisar
    // el placeholder con otra URL rota (y el flag bloquearía el segundo rescate).
    try { img.onerror = null; } catch (_) { /* noop */ }
    var label = img.alt || img.getAttribute('aria-label') || img.getAttribute('data-label') || '';
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgFor(label));
  }

  document.addEventListener('error', function (e) {
    applyFallback(e.target);
  }, true);

  // Barrido inicial: imágenes que fallaron antes de que este listener existiera
  // (p. ej. <img> eager en la parte alta de la página).
  function sweep() {
    var imgs = document.images;
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      if (img.complete && img.naturalWidth === 0) applyFallback(img);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sweep);
  } else {
    sweep();
  }
})();
