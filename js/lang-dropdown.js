/* ==========================================================================
   KAVARI · MENÚ DESPLEGABLE DE IDIOMAS (lang-dropdown.js)
   ==========================================================================
   ARCHIVO NUEVO · Convierte el botón de idiomas (#btnLang y los que llaman
   a toggleLang()) en un menú desplegable con las opciones Español, English
   y Português. Al pulsar una opción, cambia el idioma del sitio.

   El menú se abre:
     - HACIA ABAJO si hay espacio debajo del botón.
     - HACIA ARRIBA si no hay espacio (botón cerca del borde inferior).

   Secciones (búscalas con Ctrl+F):
   // ===== SECCIÓN: OPCIONES DE IDIOMA =====
   // ===== SECCIÓN: CREAR EL MENÚ =====
   // ===== SECCIÓN: POSICIONAR (abajo o arriba) =====
   // ===== SECCIÓN: ABRIR / CERRAR =====
   // ===== SECCIÓN: INICIO =====
   ========================================================================== */
(function () {
  'use strict';

  /* ===== SECCIÓN: OPCIONES DE IDIOMA ===== */
  var IDIOMAS = [
    { codigo: 'es', etiqueta: 'Español' },
    { codigo: 'en', etiqueta: 'English' },
    { codigo: 'pt', etiqueta: 'Português' }
  ];

  var menuActivo = null; // { menu, boton }

  function idiomaGuardado() {
    try {
      return localStorage.getItem('kavari-idioma') || localStorage.getItem('idioma') || 'es';
    } catch (e) {
      return 'es';
    }
  }

  /* ===== SECCIÓN: CREAR EL MENÚ ===== */
  function crearMenu(boton) {
    var menu = document.createElement('div');
    menu.className = 'lang-dropdown-menu';
    menu.setAttribute('role', 'menu');
    menu.style.position = 'fixed';
    menu.style.display = 'none';

    IDIOMAS.forEach(function (idioma) {
      var opcion = document.createElement('button');
      opcion.type = 'button';
      opcion.className = 'lang-dropdown-item';
      opcion.setAttribute('role', 'menuitem');
      opcion.setAttribute('data-lang', idioma.codigo);

      var nombre = document.createElement('span');
      nombre.className = 'lang-dropdown-item-name';
      nombre.textContent = idioma.etiqueta;

      var codigo = document.createElement('span');
      codigo.className = 'lang-dropdown-item-code';
      codigo.textContent = idioma.codigo.toUpperCase();

      opcion.appendChild(nombre);
      opcion.appendChild(codigo);

      opcion.addEventListener('click', function () {
        try {
          if (window.setIdioma) {
            window.setIdioma(idioma.codigo);
          } else if (window.toggleLang) {
            window.toggleLang();
          }
        } catch (e) { /* no romper */ }
        cerrarMenus();
      });

      menu.appendChild(opcion);
    });

    document.body.appendChild(menu);
    return menu;
  }

  function marcarActivo(menu) {
    var actual = idiomaGuardado();
    var items = menu.querySelectorAll('.lang-dropdown-item');
    for (var i = 0; i < items.length; i++) {
      if (items[i].getAttribute('data-lang') === actual) {
        items[i].classList.add('active');
      } else {
        items[i].classList.remove('active');
      }
    }
  }

  /* ===== SECCIÓN: POSICIONAR (abajo o arriba) ===== */
  function posicionarMenu(menu, boton) {
    var rect = boton.getBoundingClientRect();
    var separacion = 6;
    var altura = menu.offsetHeight || menu.getBoundingClientRect().height || 0;
    var ancho = menu.offsetWidth || menu.getBoundingClientRect().width || 0;
    var margen = 4;

    var cabeAbajo = (rect.bottom + separacion + altura) <= (window.innerHeight - margen);
    var top = cabeAbajo
      ? rect.bottom + separacion
      : Math.max(margen, rect.top - separacion - altura);

    var left = Math.max(margen, Math.min(rect.right - ancho, window.innerWidth - ancho - margen));

    menu.style.top = top + 'px';
    menu.style.left = left + 'px';
    menu.classList.toggle('open-up', !cabeAbajo);
  }

  /* ===== SECCIÓN: ABRIR / CERRAR ===== */
  function cerrarMenus() {
    if (menuActivo) {
      if (menuActivo.menu && menuActivo.menu.parentNode) {
        menuActivo.menu.parentNode.removeChild(menuActivo.menu);
      }
      menuActivo = null;
      quitarListenersGlobales();
    }
  }

  function abrirMenu(boton) {
    cerrarMenus();
    var menu = crearMenu(boton);
    menu.style.display = 'block';
    marcarActivo(menu);
    posicionarMenu(menu, boton);
    menuActivo = { menu: menu, boton: boton };
    ponerListenersGlobales();
  }

  function esClicDentro(boton, menu, objetivo) {
    if (boton && boton.contains(objetivo)) return true;
    if (menu && menu.contains(objetivo)) return true;
    return false;
  }

  function clicFuera(e) {
    if (!menuActivo) return;
    if (!esClicDentro(menuActivo.boton, menuActivo.menu, e.target)) {
      cerrarMenus();
    }
  }

  function alEscape(e) {
    if (e.key === 'Escape') cerrarMenus();
  }

  function alCambiarIdioma() {
    if (menuActivo && menuActivo.menu) {
      marcarActivo(menuActivo.menu);
      posicionarMenu(menuActivo.menu, menuActivo.boton);
    }
  }

  function ponerListenersGlobales() {
    document.addEventListener('click', clicFuera);
    document.addEventListener('keydown', alEscape);
    window.addEventListener('scroll', cerrarMenus, true);
    window.addEventListener('resize', cerrarMenus);
    window.addEventListener('kavari:langchange', alCambiarIdioma);
  }

  function quitarListenersGlobales() {
    document.removeEventListener('click', clicFuera);
    document.removeEventListener('keydown', alEscape);
    window.removeEventListener('scroll', cerrarMenus, true);
    window.removeEventListener('resize', cerrarMenus);
    window.removeEventListener('kavari:langchange', alCambiarIdioma);
  }

  /* ===== SECCIÓN: INICIO ===== */
  // Convierte cada botón de idioma en un desplegable.
  function potenciarBoton(boton) {
    if (!boton || boton.__kavariLangDropdown) return;
    boton.__kavariLangDropdown = true;

    // Quita el comportamiento anterior (cambiar idioma de golpe).
    boton.onclick = null;

    boton.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      if (menuActivo && menuActivo.boton === boton) {
        cerrarMenus();
      } else {
        abrirMenu(boton);
      }
    });
  }

  function iniciar() {
    try {
      // El botón principal de idioma está en todas las páginas.
      var botones = document.querySelectorAll('#btnLang, button[onclick="toggleLang()"]');
      for (var i = 0; i < botones.length; i++) {
        potenciarBoton(botones[i]);
      }
    } catch (e) { /* no romper */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();