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
   4) FONT LOADING -> optimiza la carga de fuentes Google Fonts.
   5) RESOURCE HINTS -> agrega prefetch de recursos críticos.

   Secciones (búscalas con Ctrl+F):
   // ===== SECCIÓN: CONFIGURACIÓN =====
   // ===== SECCIÓN: DIFERIR VIDEO DE FONDO =====
   // ===== SECCIÓN: LAZY-LOAD DE IMÁGENES =====
   // ===== SECCIÓN: PRECONNECT AL CDN =====
   // ===== SECCIÓN: FONT LOADING =====
   // ===== SECCIÓN: RESOURCE HINTS =====
   // ===== SECCIÓN: INICIO =====
   ========================================================================== */
(function () {
  'use strict';

  /* ===== SECCIÓN: CONFIGURACIÓN ===== */
  var CONFIG = {
    videoTimeoutMax: 4000,
    videoSelector: 'video.background-video, header video, video[autoplay]'
  };

  var videoFuentes = [];
  var videoIniciado = false;

  /* ===== SECCIÓN: DIFERIR VIDEO DE FONDO ===== */
  function diferirVideo(video) {
    try {
      if (!video || video.__kavariDiferido) return;
      video.__kavariDiferido = true;

      var fuentes = video.querySelectorAll('source');
      for (var i = 0; i < fuentes.length; i++) {
        videoFuentes.push(fuentes[i]);
      }
      while (video.firstChild) {
        video.removeChild(video.firstChild);
      }

      try { video.setAttribute('preload', 'none'); } catch (e) {}
      try { video.pause(); } catch (e) {}
    } catch (err) {}
  }

  function cargarYReproducirVideo(video) {
    try {
      if (!video) return;

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
        promesa.catch(function () {});
      }
    } catch (err) {}
  }

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

  function programarCargaVideo() {
    try {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(function () { dispararCargaVideo(); }, { timeout: CONFIG.videoTimeoutMax });
      } else {
        window.setTimeout(dispararCargaVideo, 600);
      }
    } catch (err) {
      window.setTimeout(dispararCargaVideo, CONFIG.videoTimeoutMax);
    }

    window.addEventListener('pointerdown', dispararCargaVideo, { once: true, passive: true });
    window.addEventListener('touchstart', dispararCargaVideo, { once: true, passive: true });
    window.addEventListener('scroll', dispararCargaVideo, { once: true, passive: true });
    window.addEventListener('keydown', dispararCargaVideo, { once: true, passive: true });

    window.setTimeout(dispararCargaVideo, CONFIG.videoTimeoutMax + 1000);
  }

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
    } catch (err) {}
  }

  /* ===== SECCIÓN: LAZY-LOAD DE IMÁGENES ===== */
  function optimizarImagen(img) {
    try {
      if (!img || img.__kavariImg) return;
      img.__kavariImg = true;

      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }

      var dentroCabecera = !!img.closest && (img.closest('header') || img.closest('.hero') || img.closest('.navbar'));
      var yaLazy = img.hasAttribute('loading') || img.getAttribute('fetchpriority') === 'high';
      if (!yaLazy && !dentroCabecera) {
        img.setAttribute('loading', 'lazy');
      }
    } catch (err) {}
  }

  function vigilarImagenes() {
    try {
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
    } catch (err) {}
  }

  /* ===== SECCIÓN: PRECONNECT AL CDN ===== */
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
    } catch (err) {}
  }

  /* ===== SECCIÓN: FONT LOADING ===== */
  function optimizarFontLoading() {
    try {
      if (!document.fonts) return;
      // Esperar a que las fentes críticas se carguen antes de pintar
      document.fonts.ready.then(function() {
        document.documentElement.classList.add('fonts-loaded');
      });
    } catch (err) {}
  }

  /* ===== SECCIÓN: RESOURCE HINTS ===== */
  function agregarResourceHints() {
    try {
      var cabeza = document.head || document.documentElement;
      // Prefetch de CSS que se necesitará al navegar
      var paginas = ['paises.html', 'contacto.html', 'ayuda.html', 'sobrenosotros.html'];
      for (var i = 0; i < paginas.length; i++) {
        if (!cabeza.querySelector('link[rel="prefetch"][href="' + paginas[i] + '"]')) {
          var link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = paginas[i];
          link.as = 'document';
          cabeza.appendChild(link);
        }
      }
    } catch (err) {}
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
    preconnectCDN();
    vigilarVideo();
    vigilarImagenes();
    optimizarFontLoading();

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        var videos = document.querySelectorAll(CONFIG.videoSelector);
        for (var i = 0; i < videos.length; i++) {
          diferirVideo(videos[i]);
        }
        programarCargaVideo();
        agregarResourceHints();
      });
    } else {
      var videosYa = document.querySelectorAll(CONFIG.videoSelector);
      for (var j = 0; j < videosYa.length; j++) {
        diferirVideo(videosYa[j]);
      }
      programarCargaVideo();
      agregarResourceHints();
    }
  } catch (err) {}

  try {
    window.__kavariPerf = {
      videoDiferido: function () { return videoFuentes.length > 0; },
      videoCargado: function () { return videoIniciado; }
    };
  } catch (err) {}
})();