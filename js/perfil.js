/**
 * perfil.js — Lógica de la página de perfil KAVARI
 * Maneja autenticación, perfil de usuario, edición de datos y configuración.
 * Conecta con Supabase a través de auth.js y supabase-client.js.
 */

(function () {
  'use strict';

  /* ─── Referencias DOM ─── */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const views = {
    authRequired: $('#perfilAuthRequired'),
    registerForm: $('#perfilRegisterForm'),
    perfilView: $('#perfilView')
  };

  const els = {
    // Login
    loginForm: $('#perfilLoginForm'),
    loginEmail: $('#loginEmail'),
    loginPassword: $('#loginPassword'),
    loginSubmitBtn: $('#loginSubmitBtn'),
    loginErrEmail: $('#loginErrEmail'),
    loginErrPassword: $('#loginErrPassword'),
    loginPwToggle: $('#loginPwToggle'),

    // Register
    registerForm: $('#registerForm'),
    regName: $('#regName'),
    regEmail: $('#regEmail'),
    regPassword: $('#regPassword'),
    regPhone: $('#regPhone'),
    regTerms: $('#regTerms'),
    regErrName: $('#regErrName'),
    regErrEmail: $('#regErrEmail'),
    regErrPassword: $('#regErrPassword'),
    regErrTerms: $('#regErrTerms'),
    registerSubmitBtn: $('#registerSubmitBtn'),
    regPwToggle: $('#regPwToggle'),

    // Google
    googleLoginBtn: $('#googleLoginBtn'),
    googleRegisterBtn: $('#googleRegisterBtn'),

    // GitHub
    githubLoginBtn: $('#githubLoginBtn'),
    githubRegisterBtn: $('#githubRegisterBtn'),

    // OTP
    showOtpBtn: $('#showOtpBtn'),
    otpSection: $('#otpSection'),
    otpEmail: $('#otpEmail'),
    otpSendBtn: $('#otpSendBtn'),
    otpCodeField: $('#otpCodeField'),
    otpCode: $('#otpCode'),
    otpVerifyBtn: $('#otpVerifyBtn'),

    // Profile view
    perfilFullName: $('#perfilFullName'),
    perfilEmail: $('#perfilEmail'),
    perfilPlanBadge: $('#perfilPlanBadge'),
    perfilAvatarImg: $('#perfilAvatarImg'),
    perfilAvatarInitials: $('#perfilAvatarInitials'),
    avatarFileInput: $('#avatarFileInput'),
    perfilLogoutBtn: $('#perfilLogoutBtn'),

    // Profile forms
    perfilInfoForm: $('#perfilInfoForm'),
    perfilName: $('#perfilName'),
    perfilPhone: $('#perfilPhone'),
    perfilBirthDate: $('#perfilBirthDate'),
    perfilCountry: $('#perfilCountry'),
    perfilInfoStatus: $('#perfilInfoStatus'),

    perfilTravelForm: $('#perfilTravelForm'),
    perfilDestinos: $('#perfilDestinos'),
    perfilBudget: $('#perfilBudget'),
    perfilEstilo: $('#perfilEstilo'),
    perfilIdiomas: $('#perfilIdiomas'),
    perfilTravelStatus: $('#perfilTravelStatus'),

    // Settings
    settingsEmail: $('#settingsEmail'),
    settingsPlan: $('#settingsPlan'),
    settingsLangToggle: $('#settingsLangToggle'),
    settingsThemeToggle: $('#settingsThemeToggle'),
    perfilDeleteAccountBtn: $('#perfilDeleteAccountBtn')
  };

  /* ─── Constantes ─── */
  const GOOGLE_CLIENT_ID = '103720820760-fi091rq34tik6dgbevv8j37v8mtt86q1.apps.googleusercontent.com';

  /* ─── Helpers ─── */
  const lang = () => localStorage.getItem('kavariIdioma') || localStorage.getItem('idioma') || 'es';
  const t = (key) => window.t ? window.t(key) : key;

  function getInitials(name) {
    return String(name || '?').trim().split(/\s+/)
      .slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('') || '?';
  }

  function showView(viewName) {
    Object.values(views).forEach(v => { if (v) v.style.display = 'none'; });
    if (views[viewName]) views[viewName].style.display = 'block';
    // Renderizar el botón de Google una vez que su vista es visible
    if (viewName === 'authRequired') {
      setTimeout(() => renderGoogleButton(els.googleLoginBtn), 0);
    } else if (viewName === 'registerForm') {
      setTimeout(() => renderGoogleButton(els.googleRegisterBtn), 0);
    }
  }

  function setStatus(el, msg, isError = false) {
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('is-error', isError);
  }

  /* ─── Cargar países en selects ─── */
  async function loadCountries(selectEl) {
    if (!selectEl) return;
    if (selectEl.dataset.loaded === '1') return;
    try {
      const res = await fetch('data/data.json');
      const data = await res.json();
      const currentVal = selectEl.value;
      selectEl.innerHTML = '<option value="">Selecciona un país</option>';
      Object.keys(data)
        .sort((a, b) => (data[a].nombre || a).localeCompare(data[b].nombre || b))
        .forEach(key => {
          const opt = document.createElement('option');
          opt.value = key;
          opt.textContent = data[key].nombre || key;
          selectEl.appendChild(opt);
        });
      if (currentVal) selectEl.value = currentVal;
      selectEl.dataset.loaded = '1';
    } catch (e) {
      console.error('[KAVARI Perfil] Error cargando países:', e);
    }
  }

  /* ─── Renderizar perfil del usuario ─── */
  function renderProfile(user, profile) {
    const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.name || user?.email?.split('@')[0] || '—';
    const email = profile?.email || user?.email || '—';
    const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
    const plan = localStorage.getItem('kavari-plan') || 'viajero';
    const planNames = { viajero: 'Viajero', premium: 'Premium', op: 'OP' };

    if (els.perfilFullName) els.perfilFullName.textContent = displayName;
    if (els.perfilEmail) els.perfilEmail.textContent = email;
    if (els.perfilPlanBadge) els.perfilPlanBadge.textContent = planNames[plan] || 'Viajero';

    if (avatarUrl) {
      els.perfilAvatarImg.src = avatarUrl;
      els.perfilAvatarImg.style.display = 'block';
      els.perfilAvatarInitials.style.display = 'none';
    } else {
      els.perfilAvatarImg.style.display = 'none';
      els.perfilAvatarInitials.style.display = 'block';
      els.perfilAvatarInitials.textContent = getInitials(displayName);
    }

    if (els.perfilName) els.perfilName.value = profile?.full_name || '';
    if (els.perfilPhone) els.perfilPhone.value = profile?.phone || '';
    if (els.perfilBirthDate) els.perfilBirthDate.value = profile?.birth_date || '';
    if (els.perfilCountry) {
      loadCountries(els.perfilCountry).then(() => {
        els.perfilCountry.value = profile?.country || '';
      });
    }

    if (els.perfilDestinos) {
      const destinos = Array.isArray(profile?.preferred_destinations) ? profile.preferred_destinations : [];
      Array.from(els.perfilDestinos.options).forEach(opt => {
        opt.selected = destinos.includes(opt.value);
      });
    }
    if (els.perfilBudget) els.perfilBudget.value = profile?.travel_budget || 'moderado';
    if (els.perfilEstilo) els.perfilEstilo.value = profile?.travel_style || 'mixto';
    if (els.perfilIdiomas) els.perfilIdiomas.value = profile?.languages || '';

    if (els.settingsEmail) els.settingsEmail.textContent = email;
    if (els.settingsPlan) els.settingsPlan.textContent = planNames[plan] || 'Viajero';
    if (els.settingsLangToggle) els.settingsLangToggle.textContent = lang().toUpperCase();
    if (els.settingsThemeToggle) {
      const theme = document.documentElement.getAttribute('data-theme') || 'light';
      els.settingsThemeToggle.textContent = theme === 'dark' ? 'ON' : 'OFF';
    }

    // Favoritos: mostrar los países con «me gusta» guardados en la cuenta
    renderFavorites();
  }

  /* ─── Favoritos: países con «me gusta» guardados en la cuenta ─── */
  let _dataJsonCache = null;

  async function getDataJson() {
    if (_dataJsonCache) return _dataJsonCache;
    try {
      const res = await fetch('data/data.json');
      _dataJsonCache = await res.json();
    } catch (e) {
      console.error('[KAVARI Perfil] Error cargando data.json:', e);
      _dataJsonCache = {};
    }
    return _dataJsonCache;
  }

  function getLocalLikes() {
    try { return JSON.parse(localStorage.getItem('kavari-pais-likes')) || {}; } catch (_) { return {}; }
  }

  function saveLocalLikes(likes) {
    try { localStorage.setItem('kavari-pais-likes', JSON.stringify(likes)); } catch (_) { /* noop */ }
  }

  const ORDER_KEY = 'kavari-pais-likes-order';
  const SORT_KEY = 'kavari-pais-likes-sort';
  const TIME_KEY = 'kavari-pais-likes-time';

  function getSavedOrder() {
    try { return JSON.parse(localStorage.getItem(ORDER_KEY)) || []; } catch (_) { return []; }
  }

  function saveSavedOrder(codes) {
    try { localStorage.setItem(ORDER_KEY, JSON.stringify(codes)); } catch (_) { /* noop */ }
  }

  /* Modo de ordenación: manual (arrastre) | alpha (alfabético) | recent */
  function getSavedSort() {
    const m = localStorage.getItem(SORT_KEY);
    return (m === 'manual' || m === 'alpha' || m === 'recent') ? m : 'manual';
  }

  function saveSavedSort(mode) {
    try { localStorage.setItem(SORT_KEY, mode); } catch (_) { /* noop */ }
  }

  function getLocalTimes() {
    try { return JSON.parse(localStorage.getItem(TIME_KEY)) || {}; } catch (_) { return {}; }
  }

  function saveLocalTimes(times) {
    try { localStorage.setItem(TIME_KEY, JSON.stringify(times)); } catch (_) { /* noop */ }
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>'"]/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[c]);
  }

  /* Códigos de países favoritos en orden de visualización:
     la cuenta de Supabase es la fuente autoritativa de los likes y de su
     orden; se combina con los likes locales del navegador (cuentas locales
     sin Supabase) y con el último orden arrastrado por el usuario. */
  async function getFavoriteCodes() {
    const codes = new Set();
    const local = getLocalLikes();
    Object.keys(local).forEach(c => { if (local[c]) codes.add(c); });
    let serverOrder = [];
    try {
      const session = await window.KavariDB.getCurrentSession();
      if (session?.user && window.KavariAuth?.getUserLikes) {
        serverOrder = (await window.KavariAuth.getUserLikes(session.user.id)) || [];
        serverOrder.forEach(c => codes.add(c));
      }
    } catch (_) { /* noop */ }

    // Prioridad: orden arrastrado por el usuario → orden del servidor → resto
    const ordered = [];
    const push = (c) => { if (codes.has(c) && !ordered.includes(c)) ordered.push(c); };
    getSavedOrder().forEach(push);
    serverOrder.forEach(push);
    codes.forEach(push);
    return ordered;
  }

  /* Nombre del país: data.json guarda una clave de traducción (p. ej.
     paisPanama_nombre) o un nombre directo; aquí resolvemos ambos. */
  function paisFavoritoNombre(entry, code) {
    const raw = entry?.nombre || code || '';
    const translated = raw && window.t ? window.t(raw) : raw;
    return (translated && translated !== raw) ? translated : raw;
  }

  function renderFavorites() {
    const grid = $('#favGrid');
    if (!grid) return;
    const empty = $('#favEmpty');
    const sortbar = $('#favSortbar');

    getDataJson().then(async (data) => {
      let codes = await getFavoriteCodes();

      // Aplicar el modo de ordenación elegido
      const mode = getSavedSort();
      if (mode === 'alpha') {
        codes = codes.slice().sort((a, b) => {
          const na = paisFavoritoNombre(data[a], a);
          const nb = paisFavoritoNombre(data[b], b);
          return na.localeCompare(nb, 'es');
        });
      } else if (mode === 'recent') {
        const times = await buildTimeMap();
        const idx = {};
        codes.forEach((c, i) => { idx[c] = i; });
        codes = codes.slice().sort((a, b) => {
          const ta = times[a] || 0;
          const tb = times[b] || 0;
          if (ta && tb) return tb - ta;
          if (ta) return -1;
          if (tb) return 1;
          return idx[a] - idx[b];
        });
      }

      grid.innerHTML = '';

      if (!codes.length) {
        if (empty) empty.style.display = 'block';
        if (sortbar) sortbar.style.display = 'none';
        return;
      }
      if (empty) empty.style.display = 'none';
      if (sortbar) sortbar.style.display = '';

      codes.forEach(code => {
        const entry = data[code] || {};
        const nombre = paisFavoritoNombre(entry, code);
        const img = entry.hero_img || entry.page_header_img || '';

        const card = document.createElement('a');
        card.className = 'perfil-fav-card';
        card.href = 'destino.html';
        card.setAttribute('aria-label', nombre);
        card.dataset.code = code;

        card.innerHTML =
          `<div class="perfil-fav-img-wrap">` +
            (img
              ? `<img src="${esc(img)}" alt="${esc(nombre)}" loading="lazy" decoding="async">`
              : `<span class="perfil-fav-fallback">${esc(nombre.slice(0, 2).toUpperCase())}</span>`) +
            `<span class="perfil-fav-heart" aria-hidden="true">♥</span>` +
            `<span class="perfil-fav-drag" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><circle cx="9" cy="6" r="1.7"/><circle cx="15" cy="6" r="1.7"/><circle cx="9" cy="12" r="1.7"/><circle cx="15" cy="12" r="1.7"/><circle cx="9" cy="18" r="1.7"/><circle cx="15" cy="18" r="1.7"/></svg></span>` +
          `</div>` +
          `<div class="perfil-fav-name">${esc(nombre)}</div>`;

        // El handle de arrastre no debe disparar la navegación del enlace
        const dragHandle = card.querySelector('.perfil-fav-drag');
        if (dragHandle) {
          dragHandle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
          });
        }

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'perfil-fav-remove';
        removeBtn.innerHTML = '&times;';
        removeBtn.title = t('perfilFavoritosQuitar') !== 'perfilFavoritosQuitar'
          ? t('perfilFavoritosQuitar') : 'Quitar de favoritos';
        removeBtn.setAttribute('aria-label', removeBtn.title);
        removeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          quitarFavorito(code, card);
        });
        card.appendChild(removeBtn);

        // Guardar el país seleccionado y dejar que el enlace navegue
        card.addEventListener('click', (e) => {
          if (e.target.closest('.perfil-fav-remove')) return;
          if (e.target.closest('.perfil-fav-drag')) return;
          localStorage.setItem('paisSeleccionado', code);
        });

        grid.appendChild(card);
      });

      initFavSortable(grid);
      updateFavSortUI();
    });
  }

  /* Fechas de like para "Más reciente": si hay sesión se usa SIEMPRE la
     fecha REAL de la cuenta (created_at de Supabase); la fecha local solo
     se usa como respaldo (cuentas locales sin Supabase). */
  async function buildTimeMap() {
    const times = getLocalTimes();
    try {
      const session = await window.KavariDB.getCurrentSession();
      if (session?.user && window.KavariAuth?.getUserLikesWithTime) {
        const rows = (await window.KavariAuth.getUserLikesWithTime(session.user.id)) || [];
        rows.forEach(r => {
          if (r.created_at) times[r.pais_code] = Date.parse(r.created_at);
        });
      }
    } catch (_) { /* noop */ }
    return times;
  }

  /* Actualiza la UI de la barra de ordenación y el estado del arrastre */
  function updateFavSortUI() {
    const mode = getSavedSort();
    document.querySelectorAll('.perfil-fav-sortbtn').forEach(btn => {
      const active = btn.dataset.sort === mode;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    const hint = $('#favHint');
    if (hint) hint.style.display = mode === 'manual' ? '' : 'none';
    const grid = $('#favGrid');
    if (grid) {
      grid.classList.toggle('perfil-fav-grid--sorted', mode !== 'manual');
      if (grid.__sortable) grid.__sortable.option('disabled', mode !== 'manual');
    }
  }

  /* Barra "Ordenar por": cambia el modo y re-renderiza los favoritos */
  function initFavSortbar() {
    document.querySelectorAll('.perfil-fav-sortbtn').forEach(btn => {
      btn.addEventListener('click', () => {
        saveSavedSort(btn.dataset.sort);
        renderFavorites();
      });
    });
  }

  /* ─── Arrastrar para reordenar los favoritos ─── */
  function initFavSortable(grid) {
    if (!window.Sortable) return; // CDN no disponible: sin arrastre
    if (grid.__sortable) grid.__sortable.destroy();
    grid.__sortable = window.Sortable.create(grid, {
      animation: 200,
      handle: '.perfil-fav-drag',
      ghostClass: 'perfil-fav-ghost',
      chosenClass: 'perfil-fav-chosen',
      dragClass: 'perfil-fav-dragging',
      onEnd: () => persistFavOrder(grid)
    });
  }

  /* Guarda el nuevo orden (local + cuenta de Supabase). */
  function persistFavOrder(grid) {
    const codes = Array.from(grid.querySelectorAll('.perfil-fav-card'))
      .map(c => c.dataset.code)
      .filter(Boolean);
    saveSavedOrder(codes);

    (async () => {
      try {
        const session = await window.KavariDB.getCurrentSession();
        if (session?.user && window.KavariAuth?.setLikeOrder) {
          await window.KavariAuth.setLikeOrder(session.user.id, codes);
        }
      } catch (e) {
        console.warn('[KAVARI Perfil] No se pudo guardar el orden en la cuenta:', e);
      }
    })();
  }

  /* Quita un favorito (local y, si hay sesión, en Supabase). */
  async function quitarFavorito(code, cardEl) {
    const likes = getLocalLikes();
    delete likes[code];
    saveLocalLikes(likes);
    // Limpiar también el orden y la fecha guardados
    saveSavedOrder(getSavedOrder().filter(c => c !== code));
    const times = getLocalTimes();
    delete times[code];
    saveLocalTimes(times);
    try {
      const session = await window.KavariDB.getCurrentSession();
      if (session?.user && window.KavariAuth?.setUserLike) {
        await window.KavariAuth.setUserLike(session.user.id, code, false);
      }
    } catch (e) {
      console.warn('[KAVARI Perfil] No se pudo quitar el favorito de la cuenta:', e);
    }
    if (cardEl) {
      cardEl.style.transition = 'opacity .25s ease, transform .25s ease';
      cardEl.style.opacity = '0';
      cardEl.style.transform = 'scale(.92)';
      setTimeout(() => {
        cardEl.remove();
        const grid = $('#favGrid');
        const empty = $('#favEmpty');
        const sortbar = $('#favSortbar');
        if (grid && !grid.children.length) {
          if (empty) empty.style.display = 'block';
          if (sortbar) sortbar.style.display = 'none';
        }
      }, 250);
    }
  }

  /* ─── Login Handler ─── */
  async function handleLogin(e) {
    e.preventDefault();
    const email = els.loginEmail.value.trim();
    const password = els.loginPassword.value;

    let valid = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus(els.loginErrEmail, 'Correo inválido', true);
      valid = false;
    } else {
      setStatus(els.loginErrEmail, '', false);
    }
    if (password.length < 6) {
      setStatus(els.loginErrPassword, 'Mínimo 6 caracteres', true);
      valid = false;
    } else {
      setStatus(els.loginErrPassword, '', false);
    }
    if (!valid) return;

    els.loginSubmitBtn.disabled = true;
    els.loginSubmitBtn.textContent = 'Ingresando…';

    const result = await window.KavariAuth.signInWithEmail(email, password);

    if (result.error) {
      setStatus(els.loginErrPassword, result.error, true);
      els.loginSubmitBtn.disabled = false;
      els.loginSubmitBtn.textContent = t('cuentaBtnIngresar');
      return;
    }

    const user = result.data?.user;
    const profile = await window.KavariAuth.getProfileWithRetry(user?.id);
    renderProfile(user, profile);
    showView('perfilView');
    els.loginSubmitBtn.disabled = false;
    els.loginSubmitBtn.textContent = t('cuentaBtnIngresar');
  }

  /* ─── Register Handler ─── */
  async function handleRegister(e) {
    e.preventDefault();
    const name = els.regName.value.trim();
    const email = els.regEmail.value.trim();
    const password = els.regPassword.value;

    let valid = true;
    if (name.length < 2) {
      setStatus(els.regErrName, 'Nombre requerido', true);
      valid = false;
    } else {
      setStatus(els.regErrName, '', false);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus(els.regErrEmail, 'Correo inválido', true);
      valid = false;
    } else {
      setStatus(els.regErrEmail, '', false);
    }
    if (password.length < 6) {
      setStatus(els.regErrPassword, 'Mínimo 6 caracteres', true);
      valid = false;
    } else {
      setStatus(els.regErrPassword, '', false);
    }
    if (!els.regTerms.checked) {
      setStatus(els.regErrTerms, 'Debes aceptar los términos', true);
      valid = false;
    } else {
      setStatus(els.regErrTerms, '', false);
    }
    if (!valid) return;

    els.registerSubmitBtn.disabled = true;
    els.registerSubmitBtn.textContent = 'Creando cuenta…';

    const result = await window.KavariAuth.signUpWithEmail(email, password, name);

    if (result.error) {
      setStatus(els.regErrEmail, result.error, true);
      els.registerSubmitBtn.disabled = false;
      els.registerSubmitBtn.textContent = t('cuentaBtnCrear');
      return;
    }

    const user = result.data?.user;
    const session = result.data?.session;

    if (session && user) {
      const profile = await window.KavariAuth.getProfileWithRetry(user.id);
      renderProfile(user, profile || { full_name: name, email });
      showView('perfilView');
    } else if (user) {
      setStatus(
        els.regErrEmail,
        'Cuenta creada. Revisa tu correo y confirma tu cuenta para poder ingresar.',
        false
      );
      els.registerForm.reset();
    }

    els.registerSubmitBtn.disabled = false;
    els.registerSubmitBtn.textContent = t('cuentaBtnCrear');
  }

  /* ─── Google Login (Google Identity Services + fallback OAuth) ─── */

  /**
   * Renderiza el botón de Google SOLO cuando su vista está visible.
   * GIS no dibuja el botón dentro de elementos con display:none (falla en silencio).
   * Si GIS no está disponible o falla, se restaura el contenido original del botón
   * y el click cae en handleGoogleClick() → OAuth redirect (igual que GitHub).
   */
  /**
   * GIS solo funciona en https o en localhost (http). En file:// u orígenes
   * no autorizados, Google lo rechaza con '[GSI_LOGGER]: origin not allowed'.
   * En ese caso dejamos el botón personalizado y el click usa OAuth redirect
   * de Supabase (el mismo flujo que ya funciona para GitHub).
   */
  function gisOriginAllowed() {
    if (window.location.protocol === 'https:') return true;
    if (window.location.protocol === 'http:') {
      const host = window.location.hostname;
      return host === 'localhost' || host === '127.0.0.1';
    }
    return false;
  }

  function renderGoogleButton(btn) {
    if (!btn) return;
    if (btn.dataset.gisRendered === 'true') return; // ya renderizado
    if (!gisOriginAllowed()) {
      // Origen no válido para GIS → usar OAuth redirect (como GitHub)
      btn.dataset.gisRendered = 'false';
      return;
    }
    if (!window.google?.accounts?.id) return;
    // No renderizar si el botón (o su contenedor) está oculto
    if (btn.offsetParent === null) return;

    // Guardamos el HTML original para poder restaurarlo si GIS falla
    if (!btn.dataset.originalHtml) {
      btn.dataset.originalHtml = btn.innerHTML;
    }

    try {
      window.google.accounts.id.renderButton(btn, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        text: 'continue_with',
        width: btn.clientWidth || 320
      });
      btn.dataset.gisRendered = 'true';
    } catch (e) {
      console.warn('[KAVARI Perfil] No se pudo renderizar el botón de Google, se usará redirección:', e);
      btn.dataset.gisRendered = 'false';
      if (btn.dataset.originalHtml) btn.innerHTML = btn.dataset.originalHtml;
    }
  }

  function initGoogleIdentity() {
    if (!window.google?.accounts?.id) {
      console.warn('[KAVARI Perfil] Google Identity Services no cargado. Se usará OAuth redirect (como GitHub).');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
        ux_mode: 'popup',
        auto_select: false
      });
    } catch (e) {
      console.warn('[KAVARI Perfil] No se pudo inicializar Google Identity Services:', e);
    }

    // El botón se renderiza cuando la vista esté visible (ver showView)
  }

  /**
   * Flujo de redirección OAuth de Supabase (el mismo que usa GitHub).
   * Redirige a Google y al volver, detectSessionInUrl de Supabase completa el login.
   */
  async function startGoogleRedirect() {
    if (!window.KavariAuth?.signInWithGoogle) return;

    showAuthError('');
    const result = await window.KavariAuth.signInWithGoogle();
    if (result.error) {
      console.error('[KAVARI Perfil] Google login error:', result.error);
      showAuthError(result.error);
    }
  }

  /**
   * Click del botón de Google. Si GIS renderizó su iframe, GIS maneja el evento
   * y NO llega aquí (el iframe intercepta el click). Si llegamos aquí, GIS no
   * está disponible o el origen no es válido, así que usamos el flujo de
   * redirección de Supabase (el mismo que ya funciona para GitHub).
   */
  async function handleGoogleClick() {
    if (els.googleLoginBtn?.querySelector('iframe') || els.googleRegisterBtn?.querySelector('iframe')) {
      return;
    }
    await startGoogleRedirect();
  }

  function showAuthError(message) {
    const loginBox = document.getElementById('perfilAuthError');
    const regBox = document.getElementById('perfilRegError');
    [loginBox, regBox].forEach(box => {
      if (!box) return;
      box.textContent = message || '';
      box.style.display = message ? 'block' : 'none';
    });
  }

  async function handleGoogleCredential(response) {
    const credential = response?.credential;
    if (!credential) return;

    showAuthError('');

    const result = await window.KavariAuth.signInWithGoogleToken(credential);
    if (result.error) {
      console.error('[KAVARI Perfil] Google login error:', result.error);
      // Fallback solo ante errores de configuración (Client ID no coincide con
      // Supabase, proveedor deshabilitado, etc.). Si es un error de negocio
      // (correo ya registrado), mostramos el mensaje y no abrimos otro flujo.
      const raw = String(result.error);
      if (/jwt|invalid_client|audience|id_token|provider.*not.*enabled|disabled/i.test(raw)) {
        console.warn('[KAVARI Perfil] Reintentando con OAuth redirect…');
        await startGoogleRedirect();
      } else {
        showAuthError(result.error);
      }
      return;
    }

    const user = result.data?.user;
    if (user) {
      const profile = await window.KavariAuth.getProfileWithRetry(user.id);
      renderProfile(user, profile);
      showView('perfilView');
      showAuthError('');
    }
  }

  /* ─── GitHub Login Handler (OAuth redirect) ─── */
  async function handleGitHubLogin() {
    showAuthError('');
    const result = await window.KavariAuth.signInWithGitHub();
    if (result.error) {
      console.error('[KAVARI Perfil] GitHub login error:', result.error);
      showAuthError(result.error);
    }
  }

  /* ─── OTP Handlers ─── */
  async function handleSendOtp() {
    const email = els.otpEmail.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    els.otpSendBtn.disabled = true;
    els.otpSendBtn.textContent = 'Enviando…';

    const result = await window.KavariAuth.sendOtpEmail(email);
    if (result.error) {
      console.error('[KAVARI Perfil] OTP error:', result.error);
      els.otpSendBtn.disabled = false;
      els.otpSendBtn.textContent = t('perfilOtpEnviar');
      return;
    }

    els.otpCodeField.style.display = 'block';
    els.otpVerifyBtn.style.display = 'block';
    els.otpSendBtn.textContent = 'Código enviado';
  }

  async function handleVerifyOtp() {
    const email = els.otpEmail.value.trim();
    const token = els.otpCode.value.trim();
    if (!email || !token) return;

    els.otpVerifyBtn.disabled = true;
    els.otpVerifyBtn.textContent = 'Verificando…';

    const result = await window.KavariAuth.verifyOtp(email, token);
    if (result.error) {
      console.error('[KAVARI Perfil] Verify error:', result.error);
      els.otpVerifyBtn.disabled = false;
      els.otpVerifyBtn.textContent = t('perfilOtpVerificar');
      return;
    }

    const user = result.data?.user;
    if (user) {
      const profile = await window.KavariAuth.getProfileWithRetry(user.id);
      renderProfile(user, profile);
      showView('perfilView');
    }
  }

  /* ─── Logout Handler ─── */
  async function handleLogout() {
    // Cerrar sesión (Supabase y/o cuenta local)
    if (window.KavariAccount && typeof window.KavariAccount.logout === 'function') {
      window.KavariAccount.logout();
    } else if (window.KavariAuth && window.KavariAuth.signOut) {
      await window.KavariAuth.signOut();
    }
    showView('authRequired');
  }

  /* ─── Avatar Upload Handler ─── */
  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const session = await window.KavariDB.getCurrentSession();
    if (!session?.user) return;

    const url = await window.KavariAuth.uploadAvatar(session.user.id, file);
    if (url) {
      els.perfilAvatarImg.src = url;
      els.perfilAvatarImg.style.display = 'block';
      els.perfilAvatarInitials.style.display = 'none';
      // Actualizar la foto en el navbar de todas las páginas
      window.dispatchEvent(new CustomEvent('kavari:profileupdate'));
    }
  }

  /* ─── Save Profile Info Handler ─── */
  async function handleSaveInfo(e) {
    e.preventDefault();
    const session = await window.KavariDB.getCurrentSession();
    if (!session?.user) return;

    const updates = {
      full_name: els.perfilName.value.trim(),
      phone: els.perfilPhone.value.trim(),
      birth_date: els.perfilBirthDate.value || null,
      country: els.perfilCountry.value || null
    };

    setStatus(els.perfilInfoStatus, 'Guardando…', false);
    const result = await window.KavariAuth.updateProfile(session.user.id, updates);
    if (result !== null) {
      setStatus(els.perfilInfoStatus, 'Perfil actualizado correctamente', false);
      els.perfilFullName.textContent = updates.full_name || '—';
      // Refrescar el nombre en el navbar de todas las páginas
      window.dispatchEvent(new CustomEvent('kavari:profileupdate'));
    } else {
      setStatus(els.perfilInfoStatus, 'Error al guardar', true);
    }
  }

  /* ─── Save Travel Preferences Handler ─── */
  async function handleSaveTravel(e) {
    e.preventDefault();
    const session = await window.KavariDB.getCurrentSession();
    if (!session?.user) return;

    const updates = {
      preferred_destinations: Array.from(els.perfilDestinos.selectedOptions).map(o => o.value),
      travel_budget: els.perfilBudget.value,
      travel_style: els.perfilEstilo.value,
      languages: els.perfilIdiomas.value.trim()
    };

    setStatus(els.perfilTravelStatus, 'Guardando…', false);
    const result = await window.KavariAuth.updateProfile(session.user.id, updates);
    if (result !== null) {
      setStatus(els.perfilTravelStatus, 'Preferencias guardadas', false);
    } else {
      setStatus(els.perfilTravelStatus, 'Error al guardar', true);
    }
  }

  /* ─── Delete Account Handler ─── */
  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      '¿Seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer.'
    );
    if (!confirmed) return;

    els.perfilDeleteAccountBtn.disabled = true;
    els.perfilDeleteAccountBtn.textContent = 'Eliminando…';

    const result = await window.KavariAuth.deleteAccount();

    if (result.error) {
      window.alert('No se pudo eliminar la cuenta: ' + result.error);
      els.perfilDeleteAccountBtn.disabled = false;
      els.perfilDeleteAccountBtn.textContent = t('perfilEliminarCuenta');
      return;
    }

    showView('authRequired');
  }

  /* ─── Tab Switching ─── */
  function initTabs() {
    $$('.perfil-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.perfil-tab').forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        $$('.perfil-tab-content').forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        const tabName = tab.dataset.tab;
        const tabId = 'tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1);
        const tabContent = document.getElementById(tabId);
        if (tabContent) tabContent.classList.add('active');
      });
    });
  }

  /* ─── View Switching (Login ↔ Register) ─── */
  function initViewSwitching() {
    const showRegisterBtn = $('#showRegisterBtn');
    const showLoginBtn = $('#showLoginBtn');

    if (showRegisterBtn) {
      showRegisterBtn.addEventListener('click', () => {
        showView('registerForm'); // showView ya renderiza el botón de Google
      });
    }
    if (showLoginBtn) {
      showLoginBtn.addEventListener('click', () => {
        showView('authRequired'); // showView ya renderiza el botón de Google
      });
    }
  }

  /* ─── Password Toggles ─── */
  function initPasswordToggles() {
    [
      { input: els.loginPassword, toggle: els.loginPwToggle },
      { input: els.regPassword, toggle: els.regPwToggle }
    ].forEach(({ input, toggle }) => {
      if (!input || !toggle) return;
      toggle.addEventListener('click', () => {
        const showing = input.type === 'text';
        input.type = showing ? 'password' : 'text';
        toggle.textContent = showing ? 'Ver' : 'Ocultar';
      });
    });
  }

  /* ─── Settings Toggles ─── */
  function initSettingsToggles() {
    if (els.settingsLangToggle) {
      els.settingsLangToggle.addEventListener('click', () => {
        const newLang = lang() === 'es' ? 'en' : 'es';
        if (typeof cambiarIdioma === 'function') {
          cambiarIdioma(newLang);
        }
        els.settingsLangToggle.textContent = newLang.toUpperCase();
      });
    }

    if (els.settingsThemeToggle) {
      els.settingsThemeToggle.addEventListener('click', () => {
        if (typeof toggleTheme === 'function') {
          toggleTheme();
        }
        const theme = document.documentElement.getAttribute('data-theme') || 'light';
        els.settingsThemeToggle.textContent = theme === 'dark' ? 'ON' : 'OFF';
      });
    }
  }

  /* ─── Auth State Listener ─── */
  function initAuthListener() {
    window.addEventListener('kavari:authchange', async (e) => {
      const { user } = e.detail;
      if (user) {
        const profile = await window.KavariAuth.getProfileWithRetry(user.id);
        renderProfile(user, profile);
        showView('perfilView');
      } else {
        showView('authRequired');
      }
    });
  }

  /* ─── Check Initial Auth State ─── */
  async function checkInitialAuth() {
    const session = await window.KavariDB.getCurrentSession();
    if (session?.user) {
      const profile = await window.KavariAuth.getProfileWithRetry(session.user.id);
      renderProfile(session.user, profile);
      showView('perfilView');
      return;
    }
    // Sesión local (localStorage, sin Supabase)
    if (window.KavariAccount && typeof window.KavariAccount.getUser === 'function') {
      const localUser = window.KavariAccount.getUser();
      if (localUser) {
        renderProfile({ name: localUser.name, email: localUser.email }, null);
        showView('perfilView');
        return;
      }
    }
    showView('authRequired');
  }

  /* ─── Init ─── */
  function init() {
    if (els.loginForm) els.loginForm.addEventListener('submit', handleLogin);
    if (els.registerForm) els.registerForm.addEventListener('submit', handleRegister);
    if (els.githubLoginBtn) els.githubLoginBtn.addEventListener('click', handleGitHubLogin);
    if (els.githubRegisterBtn) els.githubRegisterBtn.addEventListener('click', handleGitHubLogin);
    // Google: GIS renderiza su propio botón cuando está disponible; si no,
    // el click cae aquí y usa OAuth redirect (mismo flujo que GitHub).
    if (els.googleLoginBtn) els.googleLoginBtn.addEventListener('click', handleGoogleClick);
    if (els.googleRegisterBtn) els.googleRegisterBtn.addEventListener('click', handleGoogleClick);
    if (els.showOtpBtn) els.showOtpBtn.addEventListener('click', () => {
      els.otpSection.style.display = els.otpSection.style.display === 'none' ? 'flex' : 'none';
    });
    if (els.otpSendBtn) els.otpSendBtn.addEventListener('click', handleSendOtp);
    if (els.otpVerifyBtn) els.otpVerifyBtn.addEventListener('click', handleVerifyOtp);
    if (els.perfilLogoutBtn) els.perfilLogoutBtn.addEventListener('click', handleLogout);
    if (els.avatarFileInput) els.avatarFileInput.addEventListener('change', handleAvatarUpload);
    if (els.perfilInfoForm) els.perfilInfoForm.addEventListener('submit', handleSaveInfo);
    if (els.perfilTravelForm) els.perfilTravelForm.addEventListener('submit', handleSaveTravel);
    if (els.perfilDeleteAccountBtn) els.perfilDeleteAccountBtn.addEventListener('click', handleDeleteAccount);

    initTabs();
    initViewSwitching();
    initPasswordToggles();
    initSettingsToggles();
    initAuthListener();
    initGoogleIdentity();
    initFavSortbar();

    // Re-traducir los nombres de los favoritos al cambiar de idioma
    window.addEventListener('kavari:langchange', () => {
      if (views.perfilView.style.display !== 'none') renderFavorites();
    });

    // Estado inicial
    checkInitialAuth();
  }

  document.addEventListener('DOMContentLoaded', init);
})();