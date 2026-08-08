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
  const GOOGLE_CLIENT_ID = '103720820760-f0l3vlt07d1c1nitrhpg92van43078cv.apps.googleusercontent.com';

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
    const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '—';
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

  /* ─── Google Login (Google Identity Services) ─── */
  function renderGoogleButton(btn) {
    if (!btn || !window.google?.accounts?.id) return;
    window.google.accounts.id.renderButton(btn, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      shape: 'rectangular',
      text: 'continue_with'
    });
  }

  function initGoogleIdentity() {
    if (!window.google?.accounts?.id) {
      console.warn('[KAVARI Perfil] Google Identity Services no cargado.');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
      ux_mode: 'popup',
      auto_select: false
    });

    renderGoogleButton(els.googleLoginBtn);
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
      showAuthError(result.error);
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
    await window.KavariAuth.signOut();
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
        showView('registerForm');
        renderGoogleButton(els.googleRegisterBtn);
      });
    }
    if (showLoginBtn) {
      showLoginBtn.addEventListener('click', () => {
        showView('authRequired');
        renderGoogleButton(els.googleLoginBtn);
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
    } else {
      showView('authRequired');
    }
  }

  /* ─── Init ─── */
  function init() {
    if (els.loginForm) els.loginForm.addEventListener('submit', handleLogin);
    if (els.registerForm) els.registerForm.addEventListener('submit', handleRegister);
    if (els.githubLoginBtn) els.githubLoginBtn.addEventListener('click', handleGitHubLogin);
    if (els.githubRegisterBtn) els.githubRegisterBtn.addEventListener('click', handleGitHubLogin);
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

    // Estado inicial
    checkInitialAuth();
  }

  document.addEventListener('DOMContentLoaded', init);
})();