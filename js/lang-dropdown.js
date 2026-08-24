/* ==========================================================================
   KAVARI · MENÚ DESPLEGABLE DE IDIOMAS (lang-dropdown.js)
   ==========================================================================
   Menú desplegable para el botón de idiomas (#btnLang).
   El usuario DEBE hacer clic en una opción para cambiar el idioma.
   ========================================================================== */
(function () {
  'use strict';

  var IDIOMAS = [
    { codigo: 'es', nombre: 'Español' },
    { codigo: 'en', nombre: 'English' },
    { codigo: 'pt', nombre: 'Português' },
    { codigo: 'fr', nombre: 'Français' }
  ];

  var menuEl = null;

  function getLang() {
    try {
      return localStorage.getItem('kavari-idioma') || localStorage.getItem('idioma') || 'es';
    } catch (e) { return 'es'; }
  }

  // ===== CERRAR MENÚ =====
  function closeMenu() {
    if (menuEl && menuEl.parentNode) {
      menuEl.parentNode.removeChild(menuEl);
    }
    menuEl = null;
    document.removeEventListener('click', onOutsideClick, true);
    document.removeEventListener('touchstart', onOutsideClick, true);
  }

  function onOutsideClick(e) {
    if (!menuEl) return;
    if (menuEl.contains(e.target)) return;
    if (e.target.closest && e.target.closest('#btnLang')) return;
    closeMenu();
  }

  // ===== ABRIR MENÚ =====
  function openMenu(boton) {
    closeMenu();

    var menu = document.createElement('div');
    menu.className = 'lang-dropdown-menu';
    menu.setAttribute('role', 'menu');

    var actual = getLang();

    IDIOMAS.forEach(function (idioma) {
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'lang-dropdown-item' + (idioma.codigo === actual ? ' active' : '');
      item.setAttribute('role', 'menuitem');
      item.setAttribute('data-lang', idioma.codigo);

      var nameSpan = document.createElement('span');
      nameSpan.className = 'lang-dropdown-item-name';
      nameSpan.textContent = idioma.nombre;

      var codeSpan = document.createElement('span');
      codeSpan.className = 'lang-dropdown-item-code';
      codeSpan.textContent = idioma.codigo.toUpperCase();

      item.appendChild(nameSpan);
      item.appendChild(codeSpan);

      item.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
        if (window.setIdioma) {
          window.setIdioma(idioma.codigo);
        }
      });

      menu.appendChild(item);
    });

    document.body.appendChild(menu);
    menuEl = menu;

    // Posicionar el menú
    var rect = boton.getBoundingClientRect();
    var gap = 6;
    var menuH = menu.offsetHeight;
    var menuW = menu.offsetWidth;
    var m = 4;
    var fitsBelow = (rect.bottom + gap + menuH) <= (window.innerHeight - m);
    var top = fitsBelow
      ? rect.bottom + gap
      : Math.max(m, rect.top - gap - menuH);
    var left = Math.max(m, Math.min(rect.right - menuW, window.innerWidth - menuW - m));

    menu.style.top = top + 'px';
    menu.style.left = left + 'px';
    menu.classList.toggle('open-up', !fitsBelow);

    setTimeout(function () {
      document.addEventListener('click', onOutsideClick, true);
      document.addEventListener('touchstart', onOutsideClick, true);
    }, 0);
  }

  // ===== INICIALIZAR BOTONES =====
  function init() {
    window.__kavariLangDropdownActive = true;

    var botones = document.querySelectorAll('#btnLang');
    for (var i = 0; i < botones.length; i++) {
      (function (btn) {
        // IMPORTANTE: eliminar el onclick="toggleLang()" del HTML
        btn.removeAttribute('onclick');
        btn.onclick = null;

        btn.__kavariLangDropdown = true;
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (menuEl) {
            closeMenu();
          } else {
            openMenu(btn);
          }
        });
      })(botones[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
