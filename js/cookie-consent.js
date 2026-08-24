/**
 * cookie-consent.js — Banner de consentimiento de cookies KAVARI
 *
 * - Muestra un banner en la primera visita de cada usuario.
 * - Guarda la decisión en localStorage ('kavari-cookie-consent').
 * - Categorías: necesarias (siempre activas), funcionales y analíticas.
 * - Si se rechazan las funcionales, se borran los datos locales opcionales
 *   (favoritos guardados en el navegador, registros locales de viajeros).
 * - API pública: window.KavariCookieConsent = { get, open, reset }
 */
(function () {
  'use strict';

  var KEY = 'kavari-cookie-consent';
  var VERSION = 1;

  /* Claves de almacenamiento local consideradas "funcionales" (opcionales).
     Si el usuario las rechaza, se eliminan del navegador. */
  var FUNCTIONAL_KEYS = [
    'kavari-pais-likes',
    'kavari-pais-likes-order',
    'kavari-pais-likes-time',
    'kavari-travelers',
    'kavariGuides'
  ];

  function getConsent() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || null;
    } catch (_) {
      return null;
    }
  }

  function saveConsent(functional, analytics) {
    var consent = {
      v: VERSION,
      necessary: true,
      functional: !!functional,
      analytics: !!analytics,
      date: new Date().toISOString()
    };
    try {
      localStorage.setItem(KEY, JSON.stringify(consent));
      if (!consent.functional) purgeFunctionalKeys();
    } catch (_) { /* almacenamiento no disponible */ }
    hideBanner();
    return consent;
  }

  function purgeFunctionalKeys() {
    FUNCTIONAL_KEYS.forEach(function (k) {
      try { localStorage.removeItem(k); } catch (_) {}
    });
  }

  /* ─── Estilos ─── */
  var css = ''
    + '.kvcc-overlay{position:fixed;inset:0;background:rgba(8,15,31,.45);backdrop-filter:blur(2px);z-index:13000;display:none;}'
    + '.kvcc-overlay.active{display:block;}'
    + '.kvcc-banner{position:fixed;left:18px;right:18px;bottom:18px;margin:0 auto;max-width:680px;'
    + 'background:#ffffff;border:1px solid rgba(13,31,60,.10);border-radius:20px;padding:22px 24px;'
    + 'box-shadow:0 18px 48px rgba(13,31,60,.22);z-index:13001;display:none;'
    + 'font-family:Poppins,system-ui,sans-serif;color:#0d1f3c;}'
    + '.kvcc-banner.active{display:block;animation:kvccIn .35s ease both;}'
    + '@keyframes kvccIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}'
    + '[data-theme="dark"] .kvcc-banner{background:#172542;border-color:rgba(255,255,255,.12);color:#e6edf3;}'
    + '[data-theme="dark"] .kvcc-text{color:#9aa7b8 !important;}'
    + '[data-theme="dark"] .kvcc-config{border-color:rgba(255,255,255,.14) !important;background:rgba(255,255,255,.04) !important;}'
    + '.kvcc-title{font-size:1rem;font-weight:700;margin:0 0 6px;}'
    + '.kvcc-text{font-size:.86rem;line-height:1.55;color:#475569;margin:0 0 14px;}'
    + '.kvcc-actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center;}'
    + '.kvcc-btn{border:none;border-radius:999px;padding:10px 20px;font-family:inherit;font-weight:600;'
    + 'font-size:.85rem;cursor:pointer;transition:transform .15s ease, box-shadow .15s ease;}'
    + '.kvcc-btn:hover{transform:translateY(-1px);}'
    + '.kvcc-btn-accept{background:#1d4ed8;color:#fff;box-shadow:0 6px 16px rgba(29,78,216,.35);}'
    + '.kvcc-btn-reject{background:transparent;color:#334155;border:1.5px solid rgba(51,65,85,.35);}'
    + '[data-theme="dark"] .kvcc-btn-reject{color:#cbd5e1;border-color:rgba(203,213,225,.4);}'
    + '.kvcc-link{margin-left:auto;font-size:.82rem;font-weight:600;color:#1d4ed8;text-decoration:none;cursor:pointer;background:none;border:none;font-family:inherit;padding:6px 4px;}'
    + '.kvcc-link:hover{text-decoration:underline;}'
    + '.kvcc-config{display:none;margin-top:14px;padding-top:14px;border-top:1px dashed rgba(100,116,139,.35);}'
    + '.kvcc-config.open{display:block;}'
    + '.kvcc-row{display:flex;align-items:flex-start;gap:10px;padding:7px 0;font-size:.85rem;}'
    + '.kvcc-row input[type=checkbox]{width:17px;height:17px;margin-top:2px;accent-color:#1d4ed8;flex-shrink:0;}'
    + '.kvcc-row b{display:block;font-size:.88rem;}'
    + '.kvcc-row span{color:#64748b;font-size:.8rem;}'
    + '[data-theme="dark"] .kvcc-row span{color:#9aa7b8;}'
    + '.kvcc-note{font-size:.75rem;color:#94a3b8;margin:10px 0 0;}';

  /* ─── HTML ─── */
  var html = ''
    + '<div class="kvcc-banner" id="kvccBanner" role="dialog" aria-modal="false" aria-label="Consentimiento de cookies">'
    + '  <p class="kvcc-title">🍪 Tu privacidad nos importa</p>'
    + '  <p class="kvcc-text">Usamos cookies necesarias para que el sitio funcione (tu sesión y seguridad) y, con tu permiso, '
    + 'almacenamiento funcional para recordar tus preferencias y favoritos. Nunca usamos cookies publicitarias. '
    + 'Más detalles en nuestra <a href="cookies.html" style="color:#1d4ed8;font-weight:600;">Política de Cookies</a>.</p>'
    + '  <div class="kvcc-actions">'
    + '    <button type="button" class="kvcc-btn kvcc-btn-accept" id="kvccAcceptAll">Aceptar todas</button>'
    + '    <button type="button" class="kvcc-btn kvcc-btn-reject" id="kvccRejectOptional">Rechazar opcionales</button>'
    + '    <button type="button" class="kvcc-link" id="kvccToggleConfig" aria-expanded="false">Configurar</button>'
    + '  </div>'
    + '  <div class="kvcc-config" id="kvccConfigPanel">'
    + '    <label class="kvcc-row"><input type="checkbox" checked disabled><span><b>Necesarias</b>Siempre activas: sesión, seguridad y funcionamiento básico.</span></label>'
    + '    <label class="kvcc-row"><input type="checkbox" id="kvccFunctional" checked><span><b>Funcionales</b>Recuerdan tus preferencias: tema oscuro, favoritos y registros locales.</span></label>'
    + '    <label class="kvcc-row"><input type="checkbox" id="kvccAnalytics" disabled><span><b>Analíticas</b>Estadísticas de uso anónimas (no utilizadas actualmente).</span></label>'
    + '    <p class="kvcc-note">Puedes cambiar tu decisión en cualquier momento desde la Política de Cookies.</p>'
    + '    <div class="kvcc-actions" style="margin-top:10px;">'
    + '      <button type="button" class="kvcc-btn kvcc-btn-accept" id="kvccSavePrefs">Guardar preferencias</button>'
    + '    </div>'
    + '  </div>'
    + '</div>';

  var banner, configPanel;

  function inject() {
    if (document.getElementById('kvccBanner')) return;
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    document.body.insertAdjacentHTML('beforeend', html);

    banner = document.getElementById('kvccBanner');
    configPanel = document.getElementById('kvccConfigPanel');

    document.getElementById('kvccAcceptAll').addEventListener('click', function () { saveConsent(true, false); });
    document.getElementById('kvccRejectOptional').addEventListener('click', function () { saveConsent(false, false); });
    document.getElementById('kvccSavePrefs').addEventListener('click', function () {
      saveConsent(document.getElementById('kvccFunctional').checked, document.getElementById('kvccAnalytics').checked);
    });
    document.getElementById('kvccToggleConfig').addEventListener('click', function () {
      var open = configPanel.classList.toggle('open');
      this.setAttribute('aria-expanded', String(open));
    });

    if (!getConsent()) setTimeout(showBanner, 700);
  }

  function showBanner() {
    if (!banner && document.body) inject();
    if (banner) banner.classList.add('active');
  }

  function hideBanner() {
    if (banner) banner.classList.remove('active');
  }

  /* Inyectar cuando el DOM esté listo */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

  /* ─── API pública ─── */
  window.KavariCookieConsent = {
    get: getConsent,
    open: function () {
      var c = getConsent();
      if (c) {
        var f = document.getElementById('kvccFunctional');
        if (f) f.checked = !!c.functional;
      }
      showBanner();
    },
    reset: function () {
      try { localStorage.removeItem(KEY); } catch (_) {}
      showBanner();
    }
  };
})();
