/**
 * theme.js — Sistema de modo oscuro y selector de idioma global KAVARI
 * Cargado en <head> para aplicar el tema ANTES de renderizar el DOM (sin parpadeo)
 */

(function applyThemeImmediately() {
  const saved = localStorage.getItem('kavariTheme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();

function getThemeLabel(theme) {
  if (typeof window.t === 'function') {
    return theme === 'dark' ? window.t('modoClaro') : window.t('modoOscuro');
  }
  return theme === 'dark' ? 'Claro' : 'Oscuro';
}

function updateThemeButton(theme) {
  const current = theme || document.documentElement.getAttribute('data-theme') || 'light';
  const btn = document.getElementById('btnTheme');
  if (!btn) return;
  const label = getThemeLabel(current);
  btn.textContent = label;
  if (typeof window.t === 'function') {
    btn.setAttribute('aria-label', current === 'dark' ? window.t('ariaModoClaro') : window.t('ariaModoOscuro'));
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('kavariTheme', theme);
  updateThemeButton(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}


document.addEventListener('DOMContentLoaded', function() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  updateThemeButton(currentTheme);

  let savedLang = 'es';
  try {
    savedLang = localStorage.getItem('kavari-idioma') || 'es';
  } catch (e) {
    if (window.sessionStorage) savedLang = sessionStorage.getItem('kavari-idioma') || 'es';
  }

  if (typeof window.setIdioma === 'function') {
    window.setIdioma(savedLang);
  }

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('kavariTheme')) applyTheme(e.matches ? 'dark' : 'light');
    });
  }
});

window.addEventListener('kavari:langchange', function() {
  updateThemeButton();
});

