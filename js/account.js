/* Cuenta local de KAVARI: la sesión vive únicamente en este navegador. */
/* Versión mejorada: integra con Supabase cuando está disponible. */
(function () {
  const KEY = 'kavari-user';
  const PLAN_KEY = 'kavari-plan';
  const VALID_PLANS = ['viajero', 'premium', 'op'];

  const lang = () => localStorage.getItem('kavari-idioma') || 'es';

  const escapeHtml = value =>
    String(value ?? '').replace(/[&<>'"]/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
    })[char]);

  /**
   * Lee la sesión persistida de Supabase de forma síncrona.
   * Supabase guarda el token en localStorage bajo la clave "sb-<ref>-auth-token".
   */
  function getSupabaseUserSync() {
    try {
      const url = window.KavariDB && window.KavariDB.SUPABASE_URL;
      if (!url) return null;
      const projectRef = String(url).replace(/^https?:\/\//, '').split('.')[0];
      if (!projectRef) return null;
      const raw = localStorage.getItem(`sb-${projectRef}-auth-token`);
      if (!raw) return null;
      const data = JSON.parse(raw);
      const user = data && data.user;
      if (!user) return null;
      return {
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
        email: user.email,
        id: user.id,
        avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || null
      };
    } catch (_) {
      return null;
    }
  }

  /**
   * Obtiene el usuario actual.
   * Primero intenta la sesión de Supabase, luego localStorage.
   */
  function getUser() {
    // Intentar Supabase primero (sesión persistida, incluye login con Google)
    const supabaseUser = getSupabaseUserSync();
    if (supabaseUser) return supabaseUser;
    // Fallback a localStorage
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const user = JSON.parse(raw);
      if (!user || typeof user !== 'object' || !user.name || !user.email) return null;
      return user;
    } catch (_) {
      return null;
    }
  }

  function getPlan() {
    const plan = localStorage.getItem(PLAN_KEY);
    return VALID_PLANS.includes(plan) ? plan : 'viajero';
  }

  /**
   * Foto de perfil del usuario actual.
   * 1) Perfil cacheado por auth.js (kavari-profile) → lo más confiable.
   * 2) Metadatos de la sesión de Supabase (avatar_url / picture).
   */
  function getAvatar() {
    try {
      const profile = JSON.parse(localStorage.getItem('kavari-profile') || 'null');
      if (profile && profile.avatar_url) return profile.avatar_url;
    } catch (_) { /* noop */ }
    try {
      const url = window.KavariDB && window.KavariDB.SUPABASE_URL;
      if (!url) return null;
      const projectRef = String(url).replace(/^https?:\/\//, '').split('.')[0];
      const raw = localStorage.getItem(`sb-${projectRef}-auth-token`);
      if (!raw) return null;
      const meta = JSON.parse(raw)?.user?.user_metadata || {};
      if (meta.avatar_url) return meta.avatar_url;
      if (meta.picture) return meta.picture;
    } catch (_) { /* noop */ }
    return null;
  }

  function getInitials(name) {
    return String(name || '?').trim().split(/\s+/)
      .slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('') || '?';
  }

  /* Oculta el enlace estático "Registrarme" / "Mi Perfil" cuando hay sesión.
     Se oculta el <li> completo (no solo el <a>): si solo se oculta el enlace,
     el <li> queda como un hueco de ancho 0 dentro del flex y rompe la
     separación uniforme de los enlaces del navbar. */
  function setStaticNavLinks(loggedIn) {
    document.querySelectorAll('.nav-register, .nav-perfil').forEach(link => {
      const li = link.closest('li');
      if (li) {
        li.style.display = loggedIn ? 'none' : '';
      } else {
        link.style.display = loggedIn ? 'none' : '';
      }
    });
  }

  /* ─── Menú desplegable del usuario ─── */
  function closeNavMenu() {
    const menu = document.getElementById('kavariNavMenu');
    if (menu) menu.classList.remove('open');
    document.removeEventListener('click', onDocClick, true);
    document.removeEventListener('keydown', onEscKey);
  }

  function onDocClick(e) {
    const menu = document.getElementById('kavariNavMenu');
    if (!menu) return;
    if (menu.contains(e.target)) return;
    closeNavMenu();
  }

  function onEscKey(e) {
    if (e.key === 'Escape') closeNavMenu();
  }

  function handleNavLogout() {
    closeNavMenu();
    logout();
  }

  function save(user) {
    const clean = {
      name: String(user?.name || '').trim().slice(0, 80),
      email: String(user?.email || '').trim().toLowerCase().slice(0, 120),
    };
    if (!clean.name || !clean.email) return false;
    localStorage.setItem(KEY, JSON.stringify(clean));
    renderNavAccount();
    return true;
  }

  function setPlan(plan) {
    if (!VALID_PLANS.includes(plan)) return false;
    localStorage.setItem(PLAN_KEY, plan);
    renderNavAccount();
    return true;
  }

  function logout() {
    // Cerrar sesión en Supabase si está disponible
    if (window.KavariAuth && window.KavariAuth.signOut) {
      window.KavariAuth.signOut();
    }
    // Limpiar el token de sesión de Supabase directamente (necesario en
    // páginas que no cargan auth.js, p. ej. Sobre nosotros o Contacto).
    try {
      Object.keys(localStorage).forEach(key => {
        if (/^sb-.*-auth-token$/.test(key)) localStorage.removeItem(key);
      });
    } catch (_) { /* noop */ }
    localStorage.removeItem(KEY);
    localStorage.removeItem('kavari-pais-likes'); // limpiar datos locales del usuario al salir
    localStorage.removeItem('kavari-pais-likes-order'); // limpiar orden de favoritos al salir
    localStorage.removeItem('kavari-pais-likes-time'); // limpiar fechas de likes al salir
    renderNavAccount();
  }

  function renderNavAccount() {
    document.getElementById('kavari-nav-account')?.remove();
    closeNavMenu();

    const target = document.querySelector('.nav-actions')
      || document.querySelector('.portal-nav-actions')
      || document.querySelector('.page-destino .navbar')
      || document.querySelector('.topbar-nav')
      || document.querySelector('.navbar, .topbar');
    if (!target) return;

    const user = getUser();
    // Traducción segura: si no hay window.t o la clave no existe, usa el fallback.
    const tt = (key, fallback) => (window.t && window.t(key) !== key && window.t(key)) ? window.t(key) : fallback;
    const planLabel = tt('planesNavPlanes', 'Planes');
    const wrap = document.createElement('div');
    wrap.id = 'kavari-nav-account';
    wrap.className = 'kavari-nav-account';

    if (user) {
      /* === Sesión iniciada: foto de perfil + menú con cerrar sesión === */
      setStaticNavLinks(true);

      // Preferir el nombre/foto del perfil actualizado (kavari-profile) sobre la sesión
      let profile = null;
      try { profile = JSON.parse(localStorage.getItem('kavari-profile') || 'null'); } catch (_) { /* noop */ }
      const name = profile?.full_name || user.name || user.email?.split('@')[0] || 'Usuario';
      const avatar = profile?.avatar_url || user.avatar || getAvatar();
      const initials = getInitials(name);
      const firstName = String(name).split(' ')[0];

      const avatarHtml = avatar
        ? `<img class="kavari-nav-avatar" src="${escapeHtml(avatar)}" alt="Avatar de usuario" loading="lazy" data-kavari-no-fallback="1">`
        : `<span class="kavari-nav-avatar kavari-nav-avatar-fallback">${escapeHtml(initials)}</span>`;

      wrap.innerHTML =
        `<a href="planes.html" class="kavari-nav-plan">${planLabel}</a>` +
        `<div class="kavari-nav-menu" id="kavariNavMenu">` +
          `<button type="button" class="kavari-nav-user kavari-nav-user-btn" id="kavariNavUserBtn" aria-haspopup="true" aria-expanded="false">` +
            avatarHtml +
            `<span class="kavari-nav-name">${escapeHtml(firstName)}</span>` +
            `<span class="kavari-nav-caret" aria-hidden="true"></span>` +
          `</button>` +
          `<div class="kavari-nav-dropdown" role="menu">` +
            `<div class="kavari-nav-dropdown-header">` +
              `<span class="kavari-nav-dropdown-name">${escapeHtml(name)}</span>` +
              `<span class="kavari-nav-dropdown-mail">${escapeHtml(user.email || '')}</span>` +
            `</div>` +
            `<a href="perfil.html" role="menuitem">${tt('navMiPerfil', 'Mi Perfil')}</a>` +
            `<button type="button" class="kavari-nav-logout" id="kavariNavLogout" role="menuitem">${tt('cuentaCerrarSesion', 'Cerrar sesión')}</button>` +
          `</div>` +
        `</div>`;
    } else {
      /* === Visitante: botón único de iniciar sesión (→ perfil.html muestra el login) === */
      setStaticNavLinks(false);
      const loginLabel = tt('perfilIniciarSesion', 'Iniciar sesión');
      wrap.innerHTML =
        `<a href="planes.html" class="kavari-nav-plan">${planLabel}</a>` +
        `<a href="perfil.html" class="kavari-nav-user">${loginLabel}</a>`;
    }

    /* Fallback de la foto de perfil: si la imagen no carga, se muestran las iniciales.
       Se adjunta antes de insertar el nodo para no perder errores de carga inmediatos. */
    const avatarImg = wrap.querySelector('.kavari-nav-avatar');
    if (avatarImg && avatarImg.tagName === 'IMG') {
      avatarImg.addEventListener('error', () => {
        const fb = document.createElement('span');
        fb.className = 'kavari-nav-avatar kavari-nav-avatar-fallback';
        fb.textContent = initials;
        avatarImg.replaceWith(fb);
      });
    }

    target.appendChild(wrap);

    /* Comportamiento del menú desplegable */
    const menu = document.getElementById('kavariNavMenu');
    const btn = document.getElementById('kavariNavUserBtn');
    const logoutBtn = document.getElementById('kavariNavLogout');

    if (menu && btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = menu.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
        if (open) {
          document.addEventListener('click', onDocClick, true);
          document.addEventListener('keydown', onEscKey);
        } else {
          document.removeEventListener('click', onDocClick, true);
          document.removeEventListener('keydown', onEscKey);
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleNavLogout();
      });
    }
  }

  window.KavariAccount = {
    getUser,
    getPlan,
    save,
    setPlan,
    logout,
    escapeHtml,
  };

  document.addEventListener('DOMContentLoaded', renderNavAccount);
  window.addEventListener('kavari:langchange', renderNavAccount);
  window.addEventListener('kavari:authchange', renderNavAccount);
  window.addEventListener('kavari:profileupdate', renderNavAccount);
})();
/* Controlador de la vista de cuenta (tarjeta de embarque KAVARI). */
(function () {
  const root = document.getElementById('accountCard');
  if (!root || !window.KavariAccount) return;

  const esc = window.KavariAccount.escapeHtml;
  let mode = 'join';

  const PLAN_NAMES = { viajero: 'Viajero Gratis', premium: 'Premium', op: 'OP' };
  const planName = plan => PLAN_NAMES[plan] || plan;

  function loggedInView(user) {
    const t = window.t || (k => k);
    root.innerHTML = `
      <h2>${t('cuentaHola').replace('{name}', esc(user.name))}</h2>
      <p>${t('cuentaActiva')}</p>
      <div class="auth-user">
        <div class="ticket-grid">
          <div class="ticket-field"><span>${t('cuentaPasajero')}</span><strong>${esc(user.name)}</strong></div>
          <div class="ticket-field"><span>${t('cuentaCorreo')}</span><strong>${esc(user.email)}</strong></div>
          <div class="ticket-plan">
            <span class="plan-badge">PLAN · ${esc(planName(window.KavariAccount.getPlan()))}</span>
            <a class="manage-link" href="planes.html">${t('cuentaGestionar')}</a>
          </div>
        </div>
        <button type="button" id="logout">${t('cuentaCerrarSesion')}</button>
      </div>`;
    document.getElementById('logout').onclick = () => {
      window.KavariAccount.logout();
      render();
    };
  }

  function formView() {
    const t = window.t || (k => k);
    const isJoin = mode === 'join';
    root.innerHTML = `
      <h2>${isJoin ? t('cuentaUnete') : t('cuentaInicia')}</h2>
      <p>${isJoin ? t('cuentaCreaDesc') : t('cuentaAccedeDesc')}</p>

      <div class="auth-tabs" role="tablist" aria-label="Modo de acceso" data-mode="${mode}">
        <span class="tab-indicator" aria-hidden="true"></span>
        <button type="button" role="tab" id="tab-join" aria-selected="${isJoin}" aria-controls="form" class="${isJoin ? 'active' : ''}">${t('cuentaCrearTab')}</button>
        <button type="button" role="tab" id="tab-login" aria-selected="${!isJoin}" aria-controls="form" class="${!isJoin ? 'active' : ''}">${t('cuentaIngresarTab')}</button>
      </div>

      <form id="form" novalidate>
        <div class="auth-field">
          <label for="f-name">${t('cuentaNombreLabel')}</label>
          <div class="auth-input-wrap">
            <input id="f-name" name="name" required autocomplete="name" placeholder="${t('cuentaNombrePlaceholder')}">
          </div>
          <p class="auth-error" id="err-name" aria-live="polite"></p>
        </div>

        <div class="auth-field">
          <label for="f-email">${t('cuentaCorreo')}</label>
          <div class="auth-input-wrap">
            <input id="f-email" name="email" type="email" required autocomplete="email" placeholder="${t('cuentaCorreoPlaceholder')}">
          </div>
          <p class="auth-error" id="err-email" aria-live="polite"></p>
        </div>

        <div class="auth-field">
          <label for="f-password">${t('cuentaPassLabel')}</label>
          <div class="auth-input-wrap">
            <input id="f-password" name="password" type="password" minlength="6" required
                   autocomplete="${isJoin ? 'new-password' : 'current-password'}" placeholder="${t('cuentaPassPlaceholder')}">
            <button type="button" class="pw-toggle" id="pw-toggle" aria-label="${t('cuentaPassVer')}">${t('cuentaPassVer')}</button>
          </div>
          <p class="auth-error" id="err-password" aria-live="polite"></p>
        </div>

        ${isJoin ? `<div class="auth-check"><label><input type="checkbox" id="f-terms" required> <span>${t('cuentaTerminos')}</span></label><p class="auth-error" id="err-terms" aria-live="polite"></p></div>` : ''}

        <button type="submit" class="auth-submit">${isJoin ? t('cuentaBtnCrear') : t('cuentaBtnIngresar')}</button>
      </form>
    `;

    document.getElementById('tab-join').onclick = () => { mode = 'join'; render(); };
    document.getElementById('tab-login').onclick = () => { mode = 'login'; render(); };

    const pwInput = document.getElementById('f-password');
    const pwToggle = document.getElementById('pw-toggle');
    pwToggle.onclick = () => {
      const showing = pwInput.type === 'text';
      pwInput.type = showing ? 'password' : 'text';
      pwToggle.textContent = showing ? 'Ver' : 'Ocultar';
      pwToggle.setAttribute('aria-label', showing ? 'Mostrar contraseña' : 'Ocultar contraseña');
    };

    document.getElementById('form').addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(event.target);
      const name = String(data.get('name') || '').trim();
      const email = String(data.get('email') || '').trim();
      const password = String(data.get('password') || '');

      const errors = { name: '', email: '', password: '' };
      if (!name) errors.name = 'Escribe tu nombre.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Escribe un correo válido.';
      if (password.length < 6) errors.password = 'Usa al menos 6 caracteres.';

      let hasError = false;
      for (const field of ['name', 'email', 'password']) {
        const el = document.getElementById(`err-${field}`);
        if (el) el.textContent = errors[field];
        if (errors[field]) hasError = true;
      }
      if (hasError) return;

      window.KavariAccount.save({ name, email });
      render();
    });
  }

  function render() {
    const user = window.KavariAccount.getUser();
    if (user) {
      loggedInView(user);
    } else {
      formView();
    }
  }

  render();
  window.addEventListener('kavari:authchange', render);
  window.addEventListener('kavari:langchange', render);
})();