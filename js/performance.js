/* ==========================================================================
   KAVARI · PERFORMANCE (optimización de carga)
   ==========================================================================
   ARCHIVO NUEVO · SOLO AGREGA optimización, NO modifica el resto del sitio.

   Qué hace (todo es opcional y seguro, cada bloque protege con try/catch):
   1) DIFERIR EL VIDEO DE FONDO  -> evita descargar fondo.mp4 (10.85 MB)
      en la carga inicial. El video se empieza a cargar cuando la página
      queda "inactiva", al hacer scroll, o al tocar la pantalla.
   2) LAZY-LOAD DE IMÁGENES DINÁMICAS -> añade loading="lazy" y
      decoding="async" a las <img> que crea el JavaScript en tiempo real.
   3) PRECONNECT A CDN DE SUPABASE -> el navegador abre conexión antes de
      usar el script de supabase, acortando la descarga.

   Secciones (búscalas con Ctrl+F):
   // ===== SECCIÓN: CONFIGURACIÓN =====
   // ===== SECCIÓN: DIFERIR VIDEO DE FONDO =====
   // ===== SECCIÓN: LAZY-LOAD DE IMÁGENES =====
   // ===== SECCIÓN: PRECONNECT AL CDN =====
   // ===== SECCIÓN: INICIO =====
   ========================================================================== */
(function () {
  'use strict';

  /* ===== SECCIÓN: CONFIGURACIÓN ===== */
  var CONFIG = {
    // Tiempo (ms) máximo para empezar a cargar el video aunque no haya
    // scroll ni interacción (fallback de seguridad).
    videoTimeoutMax: 4000,
    // Selector del video de fondo usado en index.html, contacto.html y
    // sobrenosotros.html.
    videoSelector: 'video.background-video, header video, video[autoplay]'
  };

  var videoFuentes = [];   // <source> guardados del video (se restauran luego)
  var videoIniciado = false;

  /* ===== SECCIÓN: DIFERIR VIDEO DE FONDO ===== */
  // Captura el video apenas aparece en el DOM (antes de que termine de
  // descargar) y retira sus <source> para frenar la descarga de 10.85 MB.
  function diferirVideo(video) {
    try {
      if (!video || video.__kavariDiferido) return;
      video.__kavariDiferido = true;

      // Guarda y quita los <source> para cortar la descarga inicial.
      var fuentes = video.querySelectorAll('source');
      for (var i = 0; i < fuentes.length; i++) {
        videoFuentes.push(fuentes[i]);
      }
      while (video.firstChild) {
        video.removeChild(video.firstChild);
      }

      // No precargar nada hasta que lo pidamos nosotros.
      try { video.setAttribute('preload', 'none'); } catch (e) {}
      try { video.pause(); } catch (e) {}
    } catch (err) {
      /* no romper el sitio si algo falla */
    }
  }

  // Restaura los <source> guardados y arranca la reproducción.
  function cargarYReproducirVideo(video) {
    try {
      if (!video) return;

      // Limpia posibles <source> duplicados y restaura los originales.
      while (video.firstChild) {
        video.removeChild(video.firstChild);
      }
      for (var i = 0; i < videoFuentes.length; i++) {
        video.appendChild(videoFuentes[i]);
      }

      video.setAttribute('preload', 'auto');
      video.load();
      var promesa = video.play();
      if (promesa && typeof promesa.catch === 'function') {
        promesa.catch(function () { /* autoplay bloqueado: se ignora */ });
      }
    } catch (err) {
      /* no romper el sitio si algo falla */
    }
  }

  // Cuando toca empezar: carga el video (una sola vez).
  function dispararCargaVideo() {
    if (videoIniciado) return;
    videoIniciado = true;

    var videos = document.querySelectorAll(CONFIG.videoSelector);
    for (var i = 0; i < videos.length; i++) {
      if (videos[i].__kavariDiferido) {
        cargarYReproducirVideo(videos[i]);
      }
    }
    desconectarListeners();
  }

  // Elige el momento ideal para cargar el video: lo antes posible, pero sin
  // robar ancho de banda mientras se dibuja la página.
  function programarCargaVideo() {
    try {
      // 1) Cuando el navegador esté inactivo (requestIdleCallback).
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(function () { dispararCargaVideo(); }, { timeout: CONFIG.videoTimeoutMax });
      } else {
        // Fallback: un pequeño retardo tras terminar de cargar la página.
        window.setTimeout(dispararCargaVideo, 800);
      }
    } catch (err) {
      window.setTimeout(dispararCargaVideo, CONFIG.videoTimeoutMax);
    }

    // 2) Si el usuario interactúa antes, carga de inmediato.
    window.addEventListener('pointerdown', dispararCargaVideo, { once: true, passive: true });
    window.addEventListener('touchstart', dispararCargaVideo, { once: true, passive: true });
    window.addEventListener('scroll', dispararCargaVideo, { once: true, passive: true });
    window.addEventListener('keydown', dispararCargaVideo, { once: true, passive: true });

    // 3) Máximo de seguridad.
    window.setTimeout(dispararCargaVideo, CONFIG.videoTimeoutMax + 1500);
  }

  // Vigila el DOM: apenas aparezca el <video>, lo diferimos de inmediato.
  function vigilarVideo() {
    try {
      var raiz = document.documentElement || document;
      var observador = new MutationObserver(function (mutaciones) {
        for (var m = 0; m < mutaciones.length; m++) {
          var nodos = mutaciones[m].addedNodes;
          for (var n = 0; n < nodos.length; n++) {
            if (!nodos[n] || !nodos[n].querySelectorAll) continue;
            var videos = nodos[n].querySelectorAll(CONFIG.videoSelector);
            for (var v = 0; v < videos.length; v++) {
              diferirVideo(videos[v]);
            }
            if (nodos[n].matches && nodos[n].matches(CONFIG.videoSelector)) {
              diferirVideo(nodos[n]);
            }
          }
        }
      });
      observador.observe(raiz, { childList: true, subtree: true });
    } catch (err) {
      /* si MutationObserver no existe, al menos diferimos lo ya presente */
    }
  }

  /* ===== SECCIÓN: LAZY-LOAD DE IMÁGENES ===== */
  // Marca las imágenes creadas por JS como lazy, salvo las del encabezado
  // (que conviene cargar rápido).
  function optimizarImagen(img) {
    try {
      if (!img || img.__kavariImg) return;
      img.__kavariImg = true;

      // decoding="async" nunca daña y evita bloquear el renderizado.
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }

      // Dentro del <header>/<nav> o si ya lleva fetchpriority: se deja tal cual.
      var dentroCabecera = !!img.closest && (img.closest('header') || img.closest('.hero') || img.closest('.navbar'));
      var yaLazy = img.hasAttribute('loading') || img.getAttribute('fetchpriority') === 'high';
      if (!yaLazy && !dentroCabecera) {
        img.setAttribute('loading', 'lazy');
      }
    } catch (err) {
      /* no romper el sitio si algo falla */
    }
  }

  function vigilarImagenes() {
    try {
      // Imágenes que ya existen en el DOM (caso de scripts que corrieron antes).
      var yaPresentes = document.querySelectorAll('img');
      for (var i = 0; i < yaPresentes.length; i++) {
        optimizarImagen(yaPresentes[i]);
      }

      var observador = new MutationObserver(function (mutaciones) {
        for (var m = 0; m < mutaciones.length; m++) {
          var nodos = mutaciones[m].addedNodes;
          for (var n = 0; n < nodos.length; n++) {
            if (!nodos[n] || !nodos[n].querySelectorAll) continue;
            var imgs = nodos[n].querySelectorAll('img');
            for (var im = 0; im < imgs.length; im++) {
              optimizarImagen(imgs[im]);
            }
            if (nodos[n].matches && nodos[n].matches('img')) {
              optimizarImagen(nodos[n]);
            }
          }
        }
      });
      observador.observe(document.documentElement || document, { childList: true, subtree: true });
    } catch (err) {
      /* no romper el sitio si algo falla */
    }
  }

  /* ===== SECCIÓN: PRECONNECT AL CDN ===== */
  // El script de Supabase se sirve desde cdn.jsdelivr.net; abrir la
  // conexión antes reduce el tiempo de espera de la primera petición.
  function preconnectCDN() {
    try {
      var origenes = ['https://cdn.jsdelivr.net'];
      var cabeza = document.head || document.documentElement;
      for (var i = 0; i < origenes.length; i++) {
        if (cabeza.querySelector('link[rel="preconnect"][href="' + origenes[i] + '"]')) continue;

        var pre = document.createElement('link');
        pre.rel = 'preconnect';
        pre.href = origenes[i];
        pre.crossOrigin = 'anonymous';
        cabeza.appendChild(pre);

        var dns = document.createElement('link');
        dns.rel = 'dns-prefetch';
        dns.href = origenes[i];
        cabeza.appendChild(dns);
      }
    } catch (err) {
      /* no romper el sitio si algo falla */
    }
  }

  /* ===== SECCIÓN: INICIO ===== */
  function desconectarListeners() {
    try {
      window.removeEventListener('pointerdown', dispararCargaVideo);
      window.removeEventListener('touchstart', dispararCargaVideo);
      window.removeEventListener('scroll', dispararCargaVideo);
      window.removeEventListener('keydown', dispararCargaVideo);
    } catch (err) {}
  }

  try {
    // Se ejecuta al cargar (está en <head>, antes del body):
    preconnectCDN();
    vigilarVideo();
    vigilarImagenes();

    // Cuando el DOM esté listo, re-diferir el video por si ya existía.
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        var videos = document.querySelectorAll(CONFIG.videoSelector);
        for (var i = 0; i < videos.length; i++) {
          diferirVideo(videos[i]);
        }
        programarCargaVideo();
      });
    } else {
      var videosYa = document.querySelectorAll(CONFIG.videoSelector);
      for (var j = 0; j < videosYa.length; j++) {
        diferirVideo(videosYa[j]);
      }
      programarCargaVideo();
    }
  } catch (err) {
    /* el rendimiento nunca debe romper la página */
  }

  // Utilidad pública (para depurar en consola): window.__kavariPerf
  try {
    window.__kavariPerf = {
      videoDiferido: function () { return videoFuentes.length > 0; },
      videoCargado: function () { return videoIniciado; }
    };
  } catch (err) {}
})();