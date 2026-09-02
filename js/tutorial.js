/**
 * tutorial.js — Tutorial interactivo KAVARI con soporte multilingüe.
 * Solo se muestra al pulsar el botón "Tutorial" (nunca automáticamente).
 * El tooltip se coloca al lado del elemento resaltado (no lo tapa) y el
 * objetivo se muestra nítido mediante una "ventana" en el fondo.
 */

// Detectar página actual
const currentPage = window.location.pathname.split('/').pop() || 'index.html';

// ===== PASOS PARA INDEX =====
const tutorialStepsIndex = [
  { targetId: null, titleKey: 'tutorialIndexTitulo_0', descKey: 'tutorialIndexDesc_0', position: 'center', arrow: false },
  { targetId: 'navbar', titleKey: 'tutorialIndexTitulo_1', descKey: 'tutorialIndexDesc_1', position: 'bottom', arrow: true },
  { targetSelector: '#guiasNavBtn', titleKey: 'tutorialIndexTitulo_2', descKey: 'tutorialIndexDesc_2', position: 'bottom', arrow: true },
  { targetId: 'btnTutorial', titleKey: 'tutorialIndexTitulo_3', descKey: 'tutorialIndexDesc_3', position: 'bottom', arrow: true },
  { targetId: 'btnLang', titleKey: 'tutorialIndexTitulo_4', descKey: 'tutorialIndexDesc_4', position: 'bottom', arrow: true },
  { targetId: 'btnTheme', titleKey: 'tutorialIndexTitulo_5', descKey: 'tutorialIndexDesc_5', position: 'bottom', arrow: true },
  { targetSelector: '.search-box', titleKey: 'tutorialIndexTitulo_6', descKey: 'tutorialIndexDesc_6', position: 'top', arrow: true },
  { targetSelector: '.featured-section', titleKey: 'tutorialIndexTitulo_7', descKey: 'tutorialIndexDesc_7', position: 'top', arrow: true },
  { targetSelector: '.places-section', titleKey: 'tutorialIndexTitulo_8', descKey: 'tutorialIndexDesc_8', position: 'top', arrow: true },
  { targetSelector: '#planCta', titleKey: 'tutorialIndexTitulo_9', descKey: 'tutorialIndexDesc_9', position: 'top', arrow: true },
  { targetSelector: '.footer', titleKey: 'tutorialIndexTitulo_10', descKey: 'tutorialIndexDesc_10', position: 'top', arrow: true },
  { targetId: 'kavari-mascot', titleKey: 'tutorialIndexTitulo_11', descKey: 'tutorialIndexDesc_11', position: 'center', arrow: true },
  { targetId: null, titleKey: 'tutorialIndexTitulo_12', descKey: 'tutorialIndexDesc_12', position: 'center', arrow: false, isLast: true }
];

// ===== PASOS PARA PAÍSES =====
const tutorialStepsPaises = [
  { targetId: null, titleKey: 'tutorialPaisesTitulo_0', descKey: 'tutorialPaisesDesc_0', position: 'center', arrow: false },
  { targetId: 'btnTutorial', titleKey: 'tutorialPaisesTitulo_1', descKey: 'tutorialPaisesDesc_1', position: 'bottom', arrow: true },
  { targetId: 'btnLang', titleKey: 'tutorialPaisesTitulo_2', descKey: 'tutorialPaisesDesc_2', position: 'bottom', arrow: true },
  { targetId: 'btnTheme', titleKey: 'tutorialPaisesTitulo_3', descKey: 'tutorialPaisesDesc_3', position: 'bottom', arrow: true },
  { targetSelector: '.search-wrap', titleKey: 'tutorialPaisesTitulo_4', descKey: 'tutorialPaisesDesc_4', position: 'bottom', arrow: true },
  { targetSelector: '.stat-pill', titleKey: 'tutorialPaisesTitulo_5', descKey: 'tutorialPaisesDesc_5', position: 'bottom', arrow: true },
  { targetSelector: '.dest-card', titleKey: 'tutorialPaisesTitulo_6', descKey: 'tutorialPaisesDesc_6', position: 'center', arrow: true },
  { targetSelector: '.dest-info', titleKey: 'tutorialPaisesTitulo_7', descKey: 'tutorialPaisesDesc_7', position: 'center', arrow: true },
  { targetSelector: '.dest-btn', titleKey: 'tutorialPaisesTitulo_8', descKey: 'tutorialPaisesDesc_8', position: 'center', arrow: true },
  { targetSelector: '.region-label', titleKey: 'tutorialPaisesTitulo_9', descKey: 'tutorialPaisesDesc_9', position: 'bottom', arrow: true },
  { targetId: 'kavari-mascot', titleKey: 'tutorialPaisesTitulo_10', descKey: 'tutorialPaisesDesc_10', position: 'center', arrow: true },
  { targetId: null, titleKey: 'tutorialPaisesTitulo_11', descKey: 'tutorialPaisesDesc_11', position: 'center', arrow: false, isLast: true }
];

// ===== PASOS PARA SOBRE NOSOTROS =====
const tutorialStepsSobrenosotros = [
  { targetId: null, titleKey: 'tutorialSobrenosotrosTitulo_0', descKey: 'tutorialSobrenosotrosDesc_0', position: 'center', arrow: false },
  { targetId: 'navbar', titleKey: 'tutorialSobrenosotrosTitulo_1', descKey: 'tutorialSobrenosotrosDesc_1', position: 'bottom', arrow: true },
  { targetId: 'btnTutorial', titleKey: 'tutorialSobrenosotrosTitulo_2', descKey: 'tutorialSobrenosotrosDesc_2', position: 'bottom', arrow: true },
  { targetId: 'btnLang', titleKey: 'tutorialSobrenosotrosTitulo_3', descKey: 'tutorialSobrenosotrosDesc_3', position: 'bottom', arrow: true },
  { targetId: 'btnTheme', titleKey: 'tutorialSobrenosotrosTitulo_4', descKey: 'tutorialSobrenosotrosDesc_4', position: 'bottom', arrow: true },
  { targetSelector: '.about-intro', titleKey: 'tutorialSobrenosotrosTitulo_5', descKey: 'tutorialSobrenosotrosDesc_5', position: 'bottom', arrow: true },
  { targetSelector: '.mv-section', titleKey: 'tutorialSobrenosotrosTitulo_6', descKey: 'tutorialSobrenosotrosDesc_6', position: 'top', arrow: true },
  { targetSelector: '.member-card', titleKey: 'tutorialSobrenosotrosTitulo_7', descKey: 'tutorialSobrenosotrosDesc_7', position: 'center', arrow: true },
  { targetSelector: '.member-card.leader', titleKey: 'tutorialSobrenosotrosTitulo_8', descKey: 'tutorialSobrenosotrosDesc_8', position: 'bottom', arrow: true },
  { targetSelector: '.footer', titleKey: 'tutorialSobrenosotrosTitulo_9', descKey: 'tutorialSobrenosotrosDesc_9', position: 'top', arrow: true },
  { targetId: 'kavari-mascot', titleKey: 'tutorialSobrenosotrosTitulo_10', descKey: 'tutorialSobrenosotrosDesc_10', position: 'center', arrow: true },
  { targetId: null, titleKey: 'tutorialSobrenosotrosTitulo_11', descKey: 'tutorialSobrenosotrosDesc_11', position: 'center', arrow: false, isLast: true }
];

// ===== PASOS PARA AYUDA (página renovada) =====
const tutorialStepsAyuda = [
  { targetId: null, titleKey: 'tutorialAyudaTitulo_0', descKey: 'tutorialAyudaDesc_0', position: 'center', arrow: false },
  { targetId: 'navbar', titleKey: 'tutorialAyudaTitulo_1', descKey: 'tutorialAyudaDesc_1', position: 'bottom', arrow: true },
  { targetId: 'btnTutorial', titleKey: 'tutorialAyudaTitulo_2', descKey: 'tutorialAyudaDesc_2', position: 'bottom', arrow: true },
  { targetId: 'btnLang', titleKey: 'tutorialAyudaTitulo_3', descKey: 'tutorialAyudaDesc_3', position: 'bottom', arrow: true },
  { targetId: 'btnTheme', titleKey: 'tutorialAyudaTitulo_4', descKey: 'tutorialAyudaDesc_4', position: 'bottom', arrow: true },
  { targetSelector: '.help-search', titleKey: 'tutorialAyudaTitulo_5', descKey: 'tutorialAyudaDesc_5', position: 'bottom', arrow: true },
  { targetSelector: '.help-chips', titleKey: 'tutorialAyudaTitulo_6', descKey: 'tutorialAyudaDesc_6', position: 'top', arrow: true },
  { targetSelector: '.help-steps', titleKey: 'tutorialAyudaTitulo_7', descKey: 'tutorialAyudaDesc_7', position: 'top', arrow: true },
  { targetSelector: '.help-shortcuts', titleKey: 'tutorialAyudaTitulo_8', descKey: 'tutorialAyudaDesc_8', position: 'top', arrow: true },
  { targetSelector: '.faq-section', titleKey: 'tutorialAyudaTitulo_9', descKey: 'tutorialAyudaDesc_9', position: 'top', arrow: true },
  { targetSelector: '.help-cta', titleKey: 'tutorialAyudaTitulo_10', descKey: 'tutorialAyudaDesc_10', position: 'top', arrow: true },
  { targetId: 'kavari-mascot', titleKey: 'tutorialAyudaTitulo_11', descKey: 'tutorialAyudaDesc_11', position: 'center', arrow: true },
  { targetId: null, titleKey: 'tutorialAyudaTitulo_12', descKey: 'tutorialAyudaDesc_12', position: 'center', arrow: false, isLast: true }
];

// ===== PASOS PARA CONTACTO =====
const tutorialStepsContacto = [
  { targetId: null, titleKey: 'tutorialContactoTitulo_0', descKey: 'tutorialContactoDesc_0', position: 'center', arrow: false },
  { targetId: 'navbar', titleKey: 'tutorialContactoTitulo_1', descKey: 'tutorialContactoDesc_1', position: 'bottom', arrow: true },
  { targetId: 'btnTutorial', titleKey: 'tutorialContactoTitulo_2', descKey: 'tutorialContactoDesc_2', position: 'bottom', arrow: true },
  { targetId: 'btnLang', titleKey: 'tutorialContactoTitulo_3', descKey: 'tutorialContactoDesc_3', position: 'bottom', arrow: true },
  { targetId: 'btnTheme', titleKey: 'tutorialContactoTitulo_4', descKey: 'tutorialContactoDesc_4', position: 'bottom', arrow: true },
  { targetSelector: '.contact-float', titleKey: 'tutorialContactoTitulo_5', descKey: 'tutorialContactoDesc_5', position: 'bottom', arrow: true },
  { targetSelector: '#redes', titleKey: 'tutorialContactoTitulo_6', descKey: 'tutorialContactoDesc_6', position: 'center', arrow: true },
  { targetSelector: '#sede', titleKey: 'tutorialContactoTitulo_7', descKey: 'tutorialContactoDesc_7', position: 'top', arrow: true },
  { targetSelector: '#correos', titleKey: 'tutorialContactoTitulo_8', descKey: 'tutorialContactoDesc_8', position: 'top', arrow: true },
  { targetSelector: '.back-btn-wrap', titleKey: 'tutorialContactoTitulo_9', descKey: 'tutorialContactoDesc_9', position: 'top', arrow: true },
  { targetId: 'kavari-mascot', titleKey: 'tutorialContactoTitulo_10', descKey: 'tutorialContactoDesc_10', position: 'center', arrow: true },
  { targetId: null, titleKey: 'tutorialContactoTitulo_11', descKey: 'tutorialContactoDesc_11', position: 'center', arrow: false, isLast: true }
];

// ===== PASOS PARA DESTINO (entra a cada sección y resalta su contenido) =====
const tutorialStepsDestino = [
  { targetId: null, titleKey: 'tutorialDestinoTitulo_0', descKey: 'tutorialDestinoDesc_0', position: 'center', arrow: false },
  { targetId: 'navbar', titleKey: 'tutorialDestinoTitulo_1', descKey: 'tutorialDestinoDesc_1', position: 'bottom', arrow: true },
  { targetId: 'navLinks', titleKey: 'tutorialDestinoTitulo_2', descKey: 'tutorialDestinoDesc_2', position: 'bottom', arrow: true },
  { targetId: 'countrySwitcher', titleKey: 'tutorialDestinoTitulo_3', descKey: 'tutorialDestinoDesc_3', position: 'bottom', arrow: true },
  { targetId: 'btnTutorial', titleKey: 'tutorialDestinoTitulo_4', descKey: 'tutorialDestinoDesc_4', position: 'bottom', arrow: true },
  { targetId: 'btnLang', titleKey: 'tutorialDestinoTitulo_5', descKey: 'tutorialDestinoDesc_5', position: 'bottom', arrow: true },
  { targetId: 'btnTheme', titleKey: 'tutorialDestinoTitulo_6', descKey: 'tutorialDestinoDesc_6', position: 'bottom', arrow: true },
  { targetSelector: '.hero-content', titleKey: 'tutorialDestinoTitulo_7', descKey: 'tutorialDestinoDesc_7', position: 'top', arrow: true },
  { targetId: 'destinosInicio', titleKey: 'tutorialDestinoTitulo_8', descKey: 'tutorialDestinoDesc_8', position: 'top', arrow: true },
  { navigateTo: 'cultura', targetSelector: '#culturaItems', titleKey: 'tutorialDestinoTitulo_9', descKey: 'tutorialDestinoDesc_9', position: 'top', arrow: true },
  { navigateTo: 'lugares', targetSelector: '#todosDestinos', titleKey: 'tutorialDestinoTitulo_10', descKey: 'tutorialDestinoDesc_10', position: 'top', arrow: true },
  { navigateTo: 'gastronomia', targetSelector: '#foodGrid', titleKey: 'tutorialDestinoTitulo_11', descKey: 'tutorialDestinoDesc_11', position: 'top', arrow: true },
  { navigateTo: 'aventura', targetSelector: '#actList', titleKey: 'tutorialDestinoTitulo_12', descKey: 'tutorialDestinoDesc_12', position: 'top', arrow: true },
  { navigateTo: 'practica', targetSelector: '#infoGrid', titleKey: 'tutorialDestinoTitulo_13', descKey: 'tutorialDestinoDesc_13', position: 'top', arrow: true },
  { navigateTo: 'aerolineas', targetSelector: '#airlineGrid', titleKey: 'tutorialDestinoTitulo_14', descKey: 'tutorialDestinoDesc_14', position: 'top', arrow: true },
  { navigateTo: 'hospedajes', targetSelector: '#hospedajesGrid', titleKey: 'tutorialDestinoTitulo_15', descKey: 'tutorialDestinoDesc_15', position: 'top', arrow: true },
  { navigateTo: 'guias', targetSelector: '#guidesListContainer', titleKey: 'tutorialDestinoTitulo_16', descKey: 'tutorialDestinoDesc_16', position: 'top', arrow: true },
  { targetId: 'kavari-mascot', titleKey: 'tutorialDestinoTitulo_17', descKey: 'tutorialDestinoDesc_17', position: 'center', arrow: true },
  { targetId: null, titleKey: 'tutorialDestinoTitulo_18', descKey: 'tutorialDestinoDesc_18', position: 'center', arrow: false, isLast: true }
];

// ===== PASOS PARA PLANES (tarifas) =====
const tutorialStepsPlanes = [
  { targetId: null, titleKey: 'tutorialPlanesTitulo_0', descKey: 'tutorialPlanesDesc_0', position: 'center', arrow: false },
  { targetId: 'navbar', titleKey: 'tutorialPlanesTitulo_1', descKey: 'tutorialPlanesDesc_1', position: 'bottom', arrow: true },
  { targetId: 'btnTutorial', titleKey: 'tutorialPlanesTitulo_2', descKey: 'tutorialPlanesDesc_2', position: 'bottom', arrow: true },
  { targetId: 'btnLang', titleKey: 'tutorialPlanesTitulo_3', descKey: 'tutorialPlanesDesc_3', position: 'bottom', arrow: true },
  { targetId: 'btnTheme', titleKey: 'tutorialPlanesTitulo_4', descKey: 'tutorialPlanesDesc_4', position: 'bottom', arrow: true },
  { targetSelector: '.pricing-grid', titleKey: 'tutorialPlanesTitulo_5', descKey: 'tutorialPlanesDesc_5', position: 'top', arrow: true },
  { targetSelector: '.pricing-card.op-plan', titleKey: 'tutorialPlanesTitulo_6', descKey: 'tutorialPlanesDesc_6', position: 'center', arrow: true },
  { targetId: 'planStatus', titleKey: 'tutorialPlanesTitulo_7', descKey: 'tutorialPlanesDesc_7', position: 'top', arrow: true },
  { targetSelector: '.kv-footer', titleKey: 'tutorialPlanesTitulo_8', descKey: 'tutorialPlanesDesc_8', position: 'top', arrow: true },
  { targetId: null, titleKey: 'tutorialPlanesTitulo_9', descKey: 'tutorialPlanesDesc_9', position: 'center', arrow: false, isLast: true }
];

// ===== PASOS PARA CUENTA (acceso) =====
const tutorialStepsCuenta = [
  { targetId: null, titleKey: 'tutorialCuentaTitulo_0', descKey: 'tutorialCuentaDesc_0', position: 'center', arrow: false },
  { targetId: 'navbar', titleKey: 'tutorialCuentaTitulo_1', descKey: 'tutorialCuentaDesc_1', position: 'bottom', arrow: true },
  { targetId: 'btnTutorial', titleKey: 'tutorialCuentaTitulo_2', descKey: 'tutorialCuentaDesc_2', position: 'bottom', arrow: true },
  { targetId: 'btnLang', titleKey: 'tutorialCuentaTitulo_3', descKey: 'tutorialCuentaDesc_3', position: 'bottom', arrow: true },
  { targetId: 'btnTheme', titleKey: 'tutorialCuentaTitulo_4', descKey: 'tutorialCuentaDesc_4', position: 'bottom', arrow: true },
  { targetSelector: '.auth-shell', titleKey: 'tutorialCuentaTitulo_5', descKey: 'tutorialCuentaDesc_5', position: 'top', arrow: true },
  { targetId: 'accountCard', titleKey: 'tutorialCuentaTitulo_6', descKey: 'tutorialCuentaDesc_6', position: 'top', arrow: true },
  { targetSelector: '.kv-footer', titleKey: 'tutorialCuentaTitulo_7', descKey: 'tutorialCuentaDesc_7', position: 'top', arrow: true },
  { targetId: null, titleKey: 'tutorialCuentaTitulo_8', descKey: 'tutorialCuentaDesc_8', position: 'center', arrow: false, isLast: true }
];

// ===== PASOS PARA PERFIL (sesión iniciada) =====
const tutorialStepsPerfil = [
  { targetId: null, titleKey: 'tutorialPerfilTitulo_0', descKey: 'tutorialPerfilDesc_0', position: 'center', arrow: false },
  { targetId: 'navbar', titleKey: 'tutorialPerfilTitulo_1', descKey: 'tutorialPerfilDesc_1', position: 'bottom', arrow: true },
  { targetId: 'btnTutorial', titleKey: 'tutorialPerfilTitulo_2', descKey: 'tutorialPerfilDesc_2', position: 'bottom', arrow: true },
  { targetId: 'btnLang', titleKey: 'tutorialPerfilTitulo_3', descKey: 'tutorialPerfilDesc_3', position: 'bottom', arrow: true },
  { targetId: 'btnTheme', titleKey: 'tutorialPerfilTitulo_4', descKey: 'tutorialPerfilDesc_4', position: 'bottom', arrow: true },
  { targetSelector: '.perfil-header', titleKey: 'tutorialPerfilTitulo_5', descKey: 'tutorialPerfilDesc_5', position: 'bottom', arrow: true },
  { targetSelector: '.perfil-tabs', titleKey: 'tutorialPerfilTitulo_6', descKey: 'tutorialPerfilDesc_6', position: 'bottom', arrow: true },
  { targetId: 'perfilInfoForm', titleKey: 'tutorialPerfilTitulo_7', descKey: 'tutorialPerfilDesc_7', position: 'top', arrow: true },
  { targetId: 'perfilTravelForm', titleKey: 'tutorialPerfilTitulo_8', descKey: 'tutorialPerfilDesc_8', position: 'top', arrow: true },
  { targetId: 'favGrid', titleKey: 'tutorialPerfilTitulo_9', descKey: 'tutorialPerfilDesc_9', position: 'top', arrow: true },
  { targetId: 'settingsLangToggle', titleKey: 'tutorialPerfilTitulo_10', descKey: 'tutorialPerfilDesc_10', position: 'top', arrow: true },
  { targetSelector: '.kv-footer', titleKey: 'tutorialPerfilTitulo_11', descKey: 'tutorialPerfilDesc_11', position: 'top', arrow: true },
  { targetId: null, titleKey: 'tutorialPerfilTitulo_12', descKey: 'tutorialPerfilDesc_12', position: 'center', arrow: false, isLast: true }
];

// ===== PASOS PARA PERFIL (sin sesión) =====
const tutorialStepsPerfilAuth = [
  { targetId: null, titleKey: 'tutorialPerfilAuthTitulo_0', descKey: 'tutorialPerfilAuthDesc_0', position: 'center', arrow: false },
  { targetId: 'navbar', titleKey: 'tutorialPerfilAuthTitulo_1', descKey: 'tutorialPerfilAuthDesc_1', position: 'bottom', arrow: true },
  { targetId: 'btnTutorial', titleKey: 'tutorialPerfilAuthTitulo_2', descKey: 'tutorialPerfilAuthDesc_2', position: 'bottom', arrow: true },
  { targetId: 'btnLang', titleKey: 'tutorialPerfilAuthTitulo_3', descKey: 'tutorialPerfilAuthDesc_3', position: 'bottom', arrow: true },
  { targetId: 'btnTheme', titleKey: 'tutorialPerfilAuthTitulo_4', descKey: 'tutorialPerfilAuthDesc_4', position: 'bottom', arrow: true },
  { targetId: 'perfilLoginForm', titleKey: 'tutorialPerfilAuthTitulo_5', descKey: 'tutorialPerfilAuthDesc_5', position: 'bottom', arrow: true },
  { targetId: 'showRegisterBtn', titleKey: 'tutorialPerfilAuthTitulo_6', descKey: 'tutorialPerfilAuthDesc_6', position: 'bottom', arrow: true },
  { targetId: 'showOtpBtn', titleKey: 'tutorialPerfilAuthTitulo_7', descKey: 'tutorialPerfilAuthDesc_7', position: 'bottom', arrow: true },
  { targetSelector: '.perfil-google-btn', titleKey: 'tutorialPerfilAuthTitulo_8', descKey: 'tutorialPerfilAuthDesc_8', position: 'top', arrow: true },
  { targetSelector: '.kv-footer', titleKey: 'tutorialPerfilAuthTitulo_9', descKey: 'tutorialPerfilAuthDesc_9', position: 'top', arrow: true },
  { targetId: null, titleKey: 'tutorialPerfilAuthTitulo_10', descKey: 'tutorialPerfilAuthDesc_10', position: 'center', arrow: false, isLast: true }
];

// ===== PASOS GENERALES (respaldo para páginas sin tutorial específico) =====
const tutorialStepsGeneral = [
  { targetId: null, titleKey: 'tutorialGeneralTitulo_0', descKey: 'tutorialGeneralDesc_0', position: 'center', arrow: false },
  { targetSelector: '.portal-nav, .topbar, .page-destino .navbar', titleKey: 'tutorialGeneralTitulo_1', descKey: 'tutorialGeneralDesc_1', position: 'center', arrow: false, forceCenter: true },
  { targetSelector: '.pricing-grid, .auth-shell, .hero-actions', titleKey: 'tutorialGeneralTitulo_2', descKey: 'tutorialGeneralDesc_2', position: 'center', arrow: false, forceCenter: true },
  { targetId: 'kavari-mascot', titleKey: 'tutorialGeneralTitulo_3', descKey: 'tutorialGeneralDesc_3', position: 'center', arrow: false, forceCenter: true, isLast: true }
];

// ===== SELECCIÓN DE PASOS SEGÚN PÁGINA =====
let tutorialSteps = tutorialStepsIndex;
if (currentPage === 'paises.html') {
  tutorialSteps = tutorialStepsPaises;
} else if (currentPage === 'sobrenosotros.html' || currentPage === 'sobre-nosotros.html') {
  tutorialSteps = tutorialStepsSobrenosotros;
} else if (currentPage === 'ayuda.html') {
  tutorialSteps = tutorialStepsAyuda;
} else if (currentPage === 'contacto.html') {
  tutorialSteps = tutorialStepsContacto;
} else if (currentPage === 'destino.html') {
  tutorialSteps = tutorialStepsDestino;
} else if (currentPage === 'planes.html') {
  tutorialSteps = tutorialStepsPlanes;
} else if (currentPage === 'cuenta.html') {
  tutorialSteps = tutorialStepsCuenta;
} else if (currentPage === 'perfil.html') {
  tutorialSteps = tutorialStepsPerfil;
} else if (['guias.html'].includes(currentPage)) {
  tutorialSteps = tutorialStepsGeneral;
}

let tutorialCurrentStep = 0;
let tutorialActive = false;

// ------------------ Funciones principales ------------------
function startTutorial() {
  // Perfil: elegir pasos según si hay sesión iniciada o no
  if (currentPage === 'perfil.html') {
    const perfilView = document.getElementById('perfilView');
    const loggedIn = perfilView && perfilView.style.display !== 'none';
    tutorialSteps = loggedIn ? tutorialStepsPerfil : tutorialStepsPerfilAuth;
  }
  tutorialActive = true;
  tutorialCurrentStep = 0;
  createTutorialOverlay();
  showTutorialStep(0);
}

function createTutorialOverlay() {
  const existing = document.getElementById('kavariTutorialOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'kavariTutorialOverlay';
  overlay.innerHTML = `
    <div class="tut-backdrop" id="tutBackdrop"></div>
    <div class="tut-highlight" id="tutHighlight"></div>
    <div class="tut-tag" id="tutTag"></div>
    <div class="tut-tooltip" id="tutTooltip">
      <div class="tut-tooltip-arrow" id="tutTooltipArrow"></div>
      <div class="tut-progress-bar"><div class="tut-progress-fill" id="tutProgressFill"></div></div>
      <div class="tut-tooltip-inner">
        <div class="tut-head">
          <div class="tut-mascot"><img src="img/mascota.png" alt="Mascota de KAVARI" onerror="this.parentElement.style.display='none'"></div>
          <div class="tut-head-text">
            <div class="tut-step-num" id="tutStepNum"></div>
            <h3 class="tut-title" id="tutTitle"></h3>
          </div>
        </div>
        <p class="tut-desc" id="tutDesc"></p>
        <div class="tut-actions">
          <button class="tut-btn-skip" onclick="skipTutorial()" id="tutSkipBtn"></button>
          <div class="tut-nav-btns">
            <button class="tut-btn-prev" onclick="prevTutorialStep()" id="tutPrevBtn"></button>
            <button class="tut-btn-next" onclick="nextTutorialStep()" id="tutNextBtn"></button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.classList.add('kavari-tut-active');
  updateTutorialTexts();
  bindTutorialKeys();
}

function updateTutorialTexts() {
  const skipBtn = document.getElementById('tutSkipBtn');
  const prevBtn = document.getElementById('tutPrevBtn');
  const nextBtn = document.getElementById('tutNextBtn');
  if (skipBtn) skipBtn.textContent = t('tutorialSaltar');
  if (prevBtn) prevBtn.textContent = t('tutorialAnterior');
  if (nextBtn) nextBtn.textContent = t('tutorialSiguiente');

  if (tutorialActive) {
    showTutorialStep(tutorialCurrentStep);
  }
}

function showTutorialStep(index) {
  const step = tutorialSteps[index];
  if (!step) { endTutorial(); return; }

  const title = step.title || t(step.titleKey);
  const desc = step.desc || t(step.descKey);
  const stepNumText = t('tutorialPasoDe')
    .replace('{current}', index + 1)
    .replace('{total}', tutorialSteps.length);

  const tooltip = document.getElementById('tutTooltip');
  const inner = tooltip ? tooltip.querySelector('.tut-tooltip-inner') : null;

  // Salida suave del paso anterior (si existe)
  const swapContent = () => {
    document.getElementById('tutTitle').textContent = title;
    document.getElementById('tutDesc').textContent = desc;
    document.getElementById('tutStepNum').textContent = stepNumText;

    const prevBtn = document.getElementById('tutPrevBtn');
    const nextBtn = document.getElementById('tutNextBtn');
    const skipBtn = document.getElementById('tutSkipBtn');
    prevBtn.style.display = index === 0 ? 'none' : '';
    nextBtn.textContent = step.isLast ? t('tutorialComenzar') : t('tutorialSiguiente');
    skipBtn.style.display = step.isLast ? 'none' : '';

    const fill = document.getElementById('tutProgressFill');
    if (fill) fill.style.width = ((index + 1) / tutorialSteps.length * 100) + '%';

    tutorialCurrentStep = index;

    // Si el paso pide entrar a una sección (páginas tipo destino),
    // navegamos antes de posicionar el resaltado.
    if (step.navigateTo && typeof window.showSection === 'function') {
      window.showSection(step.navigateTo);
    }

    refreshTutorialHighlight(step);

    if (inner) {
      inner.classList.remove('tut-exit');
      void inner.offsetWidth;
      inner.classList.add('tut-enter');
    }
  };

  if (inner && (inner.classList.contains('tut-enter') || inner.classList.contains('tut-exit'))) {
    inner.classList.add('tut-exit');
    setTimeout(swapContent, 160);
  } else {
    swapContent();
  }
}

// ------------------ Funciones auxiliares ------------------
function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getTutorialTarget(step) {
  if (step.targetId) return document.getElementById(step.targetId);
  if (step.targetSelector) return document.querySelector(step.targetSelector);
  return null;
}

function refreshTutorialHighlight(step, skipScroll = false) {
  let targetEl = getTutorialTarget(step);
  if (step.forceCenter) targetEl = null;
  highlightElement(targetEl, step);
  positionTooltip(step);

  if (targetEl && !skipScroll && !prefersReducedMotion()) {
    setTimeout(() => {
      const r = targetEl.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 130);
  }
}

// Al hacer scroll solo seguimos al elemento resaltado; el tooltip es fijo
window.addEventListener('scroll', () => {
  if (!tutorialActive) return;
  const step = tutorialSteps[tutorialCurrentStep];
  if (!step || step.forceCenter) return;
  highlightElement(getTutorialTarget(step), step);
}, { passive: true });

// ===== positionTooltip: coloca el tooltip AL LADO del objetivo =====
// Para que el elemento resaltado se vea completo, el tooltip se ubica
// debajo, arriba, a la derecha o a la izquierda del objetivo según el
// espacio disponible, con una flecha que apunta hacia él.
function positionTooltip(step) {
  const tooltip = document.getElementById('tutTooltip');
  const arrow = document.getElementById('tutTooltipArrow');
  if (!tooltip) return;

  const target = step && !step.forceCenter ? getTutorialTarget(step) : null;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const tooltipW = Math.min(460, vw - 32);
  tooltip.style.width = tooltipW + 'px';

  const setCenter = () => {
    tooltip.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); width:' + tooltipW + 'px;';
    if (arrow) { arrow.style.display = 'none'; arrow.className = 'tut-tooltip-arrow'; }
  };

  if (!target) { setCenter(); return; }

  const rect = target.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) { setCenter(); return; }

  // Predecir la posición del objetivo tras el scroll centrado (block:'center')
  let rTop = rect.top;
  if (rect.top < 0 || rect.bottom > vh) {
    rTop = Math.max((vh - rect.height) / 2, 0);
  }
  const rLeft = rect.left;
  const rWidth = rect.width;
  const rBottom = rTop + rect.height;
  const rCenterX = rLeft + rWidth / 2;

  const gap = 18;
  const tooltipH = tooltip.offsetHeight || 240;
  const fits = (top, left) => top >= 10 && top + tooltipH <= vh - 10 && left >= 10 && left + tooltipW <= vw - 10;

  const place = (top, left, arrowCls, arrowPct) => {
    tooltip.style.cssText = 'position:fixed; top:' + top + 'px; left:' + left + 'px; transform:none; width:' + tooltipW + 'px;';
    if (arrow) {
      arrow.className = 'tut-tooltip-arrow ' + arrowCls;
      arrow.style.display = 'block';
      arrow.style.left = (arrowCls === 'arrow-top' || arrowCls === 'arrow-bottom') ? arrowPct : '';
    }
  };

  let top, left;

  // 1) Debajo del objetivo
  top = rBottom + gap;
  left = Math.max(10, Math.min(rCenterX - tooltipW / 2, vw - tooltipW - 10));
  if (fits(top, left)) { place(top, left, 'arrow-bottom', Math.max(12, Math.min((rCenterX - left) / tooltipW * 100, 88)) + '%'); return; }

  // 2) Arriba del objetivo
  top = rTop - gap - tooltipH;
  left = Math.max(10, Math.min(rCenterX - tooltipW / 2, vw - tooltipW - 10));
  if (fits(top, left)) { place(top, left, 'arrow-top', Math.max(12, Math.min((rCenterX - left) / tooltipW * 100, 88)) + '%'); return; }

  // 3) A la derecha
  top = Math.max(10, Math.min((rTop + rect.height / 2) - tooltipH / 2, vh - tooltipH - 10));
  left = rLeft + rWidth + gap;
  if (fits(top, left)) { place(top, left, 'arrow-right', '50%'); return; }

  // 4) A la izquierda
  left = rLeft - gap - tooltipW;
  if (fits(top, left)) { place(top, left, 'arrow-left', '50%'); return; }

  // 5) Sin espacio: centrado
  setCenter();
}

function highlightElement(el, step) {
  const highlight = document.getElementById('tutHighlight');
  const tag = document.getElementById('tutTag');
  if (!el) {
    if (highlight) highlight.style.display = 'none';
    if (tag) tag.style.display = 'none';
    return;
  }
  const rect = el.getBoundingClientRect();
  highlight.style.cssText = `
    display: block;
    position: fixed;
    top: ${rect.top - 6}px;
    left: ${rect.left - 6}px;
    width: ${rect.width + 12}px;
    height: ${rect.height + 12}px;
    border-radius: 16px;
    pointer-events: auto;
    transition: all .5s cubic-bezier(.22,1,.36,1);
    will-change: top, left, width, height;
    z-index: 10001;
  `;
  if (tag && step) {
    const title = step.title || t(step.titleKey);
    tag.textContent = '▸ ' + title;
    tag.style.display = 'block';
    const tagW = Math.min(300, window.innerWidth - 24);
    const left = Math.max(8, Math.min(rect.left + rect.width / 2 - tagW / 2, window.innerWidth - tagW - 8));
    const top = rect.top - 6 - 36;
    tag.style.cssText = `position:fixed; top:${top < 8 ? rect.bottom + 10 : top}px; left:${left}px; width:${tagW}px; display:block;`;
  }
}

// ------------------ Navegación del tutorial ------------------
function nextTutorialStep() {
  tutorialCurrentStep++;
  if (tutorialCurrentStep >= tutorialSteps.length) endTutorial();
  else showTutorialStep(tutorialCurrentStep);
}

function prevTutorialStep() {
  if (tutorialCurrentStep > 0) {
    tutorialCurrentStep--;
    showTutorialStep(tutorialCurrentStep);
  }
}

function skipTutorial() { endTutorial(); }

function endTutorial() {
  tutorialActive = false;
  document.body.classList.remove('kavari-tut-active');
  const overlay = document.getElementById('kavariTutorialOverlay');
  if (overlay) {
    overlay.classList.add('tut-exiting');
    setTimeout(() => overlay.remove(), 340);
  }
}

// ------------------ Atajos de teclado ------------------
let tutorialKeysBound = false;
function bindTutorialKeys() {
  if (tutorialKeysBound) return;
  tutorialKeysBound = true;
  document.addEventListener('keydown', (e) => {
    if (!tutorialActive) return;
    if (e.target && e.target.closest && e.target.closest('button')) return;
    if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      nextTutorialStep();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevTutorialStep();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      skipTutorial();
    }
  });
}

// ------------------ Escuchar cambios de idioma ------------------
window.addEventListener('kavari:langchange', updateTutorialTexts);