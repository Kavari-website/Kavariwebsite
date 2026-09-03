/* KAVARI · Fallback mínimo de imágenes rotas
 * Solo reemplaza imágenes que fallaron con un error real (404, red, CORS).
 * No interviene en imágenes que aún cargan o que cargaron correctamente.
 */
(function () {
  'use strict';
  if (window.__kavariImgFallback) return;
  window.__kavariImgFallback = true;

  document.addEventListener('error', function (e) {
    var img = e.target;
    if (!img || img.tagName !== 'IMG') return;
    if (img.dataset.kavariFallback) return;
    if (img.dataset.kavariNoFallback === '1') return;
    if (!img.src || img.src.indexOf('data:') === 0) return;
    img.dataset.kavariFallback = '1';
    try { img.onerror = null; } catch (_) {}
    img.alt = img.alt || 'Imagen no disponible';
  }, true);
})();
