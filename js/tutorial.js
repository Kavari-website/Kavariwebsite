/**
 * tutorial.js — Tutorial interactivo KAVARI con soporte multilingüe
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
  { targetSelector: '.footer', titleKey: 'tutorialIndexTitulo_9', descKey: 'tutorialIndexDesc_9', position: 'top', arrow: true },
  { targetId: 'kavari-mascot', titleKey: 'tutorialIndexTitulo_10', descKey: 'tutorialIndexDesc_10', position: 'center', arrow: true },
  { targetId: null, titleKey: 'tutorialIndexTitulo_11', descKey: 'tutorialIndexDesc_11', position: 'center', arrow: false, isLast: true }
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

// ===== PASOS PARA AYUDA =====
const tutorialStepsAyuda = [
  { targetId: null, titleKey: 'tutorialAyudaTitulo_0', descKey: 'tutorialAyudaDesc_0', position: 'center', arrow: false },
  { targetId: 'navbar', titleKey: 'tutorialAyudaTitulo_1', descKey: 'tutorialAyudaDesc_1', position: 'bottom', arrow: true },
  { targetId: 'btnTutorial', titleKey: 'tutorialAyudaTitulo_2', descKey: 'tutorialAyudaDesc_2', position: 'bottom', arrow: true },
  { targetId: 'btnLang', titleKey: 'tutorialAyudaTitulo_3', descKey: 'tutorialAyudaDesc_3', position: 'bottom', arrow: true },
  { targetId: 'btnTheme', titleKey: 'tutorialAyudaTitulo_4', descKey: 'tutorialAyudaDesc_4', position: 'bottom', arrow: true },
  { targetSelector: '.help-search', titleKey: 'tutorialAyudaTitulo_5', descKey: 'tutorialAyudaDesc_5', position: 'bottom', arrow: true },
  { targetSelector: '.help-categories', titleKey: 'tutorialAyudaTitulo_6', descKey: 'tutorialAyudaDesc_6', position: 'top', arrow: true },
  { targetSelector: '.faq-section', titleKey: 'tutorialAyudaTitulo_7', descKey: 'tutorialAyudaDesc_7', position: 'top', arrow: true },
  { targetSelector: '.faq-item', titleKey: 'tutorialAyudaTitulo_8', descKey: 'tutorialAyudaDesc_8', position: 'center', arrow: true },
  { targetSelector: '.help-cta', titleKey: 'tutorialAyudaTitulo_9', descKey: 'tutorialAyudaDesc_9', position: 'top', arrow: true },
  { targetId: 'kavari-mascot', titleKey: 'tutorialAyudaTitulo_10', descKey: 'tutorialAyudaDesc_10', position: 'center', arrow: true },
  { targetId: null, titleKey: 'tutorialAyudaTitulo_11', descKey: 'tutorialAyudaDesc_11', position: 'center', arrow: false, isLast: true }
];

// ===== PASOS PARA CONTACTO =====
const tutorialStepsContacto = [
  { targetId: null, titleKey: 'tutorialContactoTitulo_0', descKey: 'tutorialContactoDesc_0', position: 'center', arrow: false },
  { targetId: 'navbar', titleKey: 'tutorialContactoTitulo_1', descKey: 'tutorialContactoDesc_1', position: 'bottom', arrow: true },
  { targetId: 'btnTutorial', titleKey: 'tutorialContactoTitulo_2', descKey: 'tutorialContactoDesc_2', position: 'bottom', arrow: true },
  { targetId: 'btnLang', titleKey: 'tutorialContactoTitulo_3', descKey: 'tutorialContactoDesc_3', position: 'bottom', arrow: true },
  { targetId: 'btnTheme', titleKey: 'tutorialContactoTitulo_4', descKey: 'tutorialContactoDesc_4', position: 'bottom', arrow: true },
  { targetSelector: '.contact-float', titleKey: 'tutorialContactoTitulo_5', descKey: 'tutorialContactoDesc_5', position: 'bottom', arrow: true },
  { targetSelector: '.contact-ig', titleKey: 'tutorialContactoTitulo_6', descKey: 'tutorialContactoDesc_6', position: 'center', arrow: true },
  { targetSelector: '#sede', titleKey: 'tutorialContactoTitulo_7', descKey: 'tutorialContactoDesc_7', position: 'top', arrow: true },
  { targetSelector: '#correos', titleKey: 'tutorialContactoTitulo_8', descKey: 'tutorialContactoDesc_8', position: 'top', arrow: true },
  { targetSelector: '.back-btn-wrap', titleKey: 'tutorialContactoTitulo_9', descKey: 'tutorialContactoDesc_9', position: 'top', arrow: true },
  { targetId: 'kavari-mascot', titleKey: 'tutorialContactoTitulo_10', descKey: 'tutorialContactoDesc_10', position: 'center', arrow: true },
  { targetId: null, titleKey: 'tutorialContactoTitulo_11', descKey: 'tutorialContactoDesc_11', position: 'center', arrow: false, isLast: true }
];

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
  { targetSelector: 'a[data-sec="cultura"]', titleKey: 'tutorialDestinoTitulo_9', descKey: 'tutorialDestinoDesc_9', position: 'bottom', arrow: true },
  { targetSelector: 'a[data-sec="lugares"]', titleKey: 'tutorialDestinoTitulo_10', descKey: 'tutorialDestinoDesc_10', position: 'bottom', arrow: true },
  { targetSelector: 'a[data-sec="gastronomia"]', titleKey: 'tutorialDestinoTitulo_11', descKey: 'tutorialDestinoDesc_11', position: 'bottom', arrow: true },
  { targetSelector: 'a[data-sec="aventura"]', titleKey: 'tutorialDestinoTitulo_12', descKey: 'tutorialDestinoDesc_12', position: 'bottom', arrow: true },
  { targetSelector: 'a[data-sec="practica"]', titleKey: 'tutorialDestinoTitulo_13', descKey: 'tutorialDestinoDesc_13', position: 'bottom', arrow: true },
  { targetSelector: 'a[data-sec="aerolineas"]', titleKey: 'tutorialDestinoTitulo_14', descKey: 'tutorialDestinoDesc_14', position: 'bottom', arrow: true },
  { targetSelector: 'a[data-sec="hospedajes"]', titleKey: 'tutorialDestinoTitulo_15', descKey: 'tutorialDestinoDesc_15', position: 'bottom', arrow: true },
  { targetSelector: 'a[data-sec="souvenires"]', titleKey: 'tutorialDestinoTitulo_16', descKey: 'tutorialDestinoDesc_16', position: 'bottom', arrow: true },
  { targetSelector: 'a[data-sec="guias"]', titleKey: 'tutorialDestinoTitulo_17', descKey: 'tutorialDestinoDesc_17', position: 'bottom', arrow: true },
  { targetId: 'kavari-mascot', titleKey: 'tutorialDestinoTitulo_18', descKey: 'tutorialDestinoDesc_18', position: 'center', arrow: true },
  { targetId: null, titleKey: 'tutorialDestinoTitulo_19', descKey: 'tutorialDestinoDesc_19', position: 'center', arrow: false, isLast: true }
];

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
} else if (['guias.html', 'planes.html', 'cuenta.html'].includes(currentPage)) {
  tutorialSteps = tutorialStepsGeneral;
}

let tutorialCurrentStep = 0;
let tutorialActive = false;

// ------------------ Funciones principales ------------------
function startTutorial(force = false) {
  let tutorialKey = 'kavariTutorialVisto';
  if (currentPage === 'paises.html') tutorialKey = 'kavariTutorialPaisesVisto';
  else if (currentPage === 'sobrenosotros.html' || currentPage === 'sobre-nosotros.html') tutorialKey = 'kavariTutorialSobrenosotrosVisto';
  else if (currentPage === 'ayuda.html') tutorialKey = 'kavariTutorialAyudaVisto';
  else if (currentPage === 'contacto.html') tutorialKey = 'kavariTutorialContactoVisto';
  else if (currentPage === 'destino.html') tutorialKey = 'kavariTutorialDestinoVisto';

  const visto = localStorage.getItem(tutorialKey);
  if (visto && !force) return;
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
      <div class="tut-progress-bar"><div class="tut-progress-fill" id="tutProgressFill"></div></div>
      <div class="tut-head">
        <div class="tut-mascot"><img src="img/mascota.png" alt="" onerror="this.parentElement.style.display='none'"></div>
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
    refreshTutorialHighlight(step);

    tooltip.classList.remove('tut-exit');
    void tooltip.offsetWidth;
    tooltip.classList.add('tut-enter');
  };

  if (tooltip.classList.contains('tut-enter') || tooltip.classList.contains('tut-exit')) {
    tooltip.classList.add('tut-exit');
    setTimeout(swapContent, 140);
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
  positionTooltip(step);
  highlightElement(targetEl, step);

  if (targetEl && !skipScroll && !prefersReducedMotion()) {
    setTimeout(() => {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  }
}

window.addEventListener('scroll', () => {
  if (!tutorialActive) return;
  const step = tutorialSteps[tutorialCurrentStep];
  if (step) refreshTutorialHighlight(step, true);
}, { passive: true });

// ===== positionTooltip: SIEMPRE centrado en la pantalla =====
// El tutorial aparece en el centro de la vista del usuario (su
// computadora), sin anclarse a ningún elemento de la página.
function positionTooltip(step) {
  const tooltip = document.getElementById('tutTooltip');
  if (!tooltip) return;
  tooltip.style.cssText = `
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: min(520px, 92vw);
  `;
}

function highlightElement(el, step) {
  const highlight = document.getElementById('tutHighlight');
  const tag = document.getElementById('tutTag');
  if (!el) {
    highlight.style.display = 'none';
    if (tag) tag.style.display = 'none';
    return;
  }
  const rect = el.getBoundingClientRect();
  highlight.style.cssText = `
    display: block;
    position: fixed;
    top: ${rect.top - 8}px;
    left: ${rect.left - 8}px;
    width: ${rect.width + 16}px;
    height: ${rect.height + 16}px;
    border-radius: 16px;
    box-shadow: 0 0 0 9999px rgba(8, 18, 40, 0.55), 0 0 0 3px var(--tut-highlight-border), 0 0 34px var(--tut-highlight-shadow);
    pointer-events: none;
    transition: all .45s cubic-bezier(.22,1,.36,1);
    will-change: transform, box-shadow;
    z-index: 10001;
  `;
  if (tag && step) {
    const title = step.title || t(step.titleKey);
    tag.textContent = '▸ ' + title;
    tag.style.display = 'block';
    const tagW = Math.min(300, window.innerWidth - 24);
    const left = Math.max(8, Math.min(rect.left + rect.width / 2 - tagW / 2, window.innerWidth - tagW - 8));
    const top = rect.top - 8 - 34;
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
  let tutorialKey = 'kavariTutorialVisto';
  if (currentPage === 'paises.html') tutorialKey = 'kavariTutorialPaisesVisto';
  else if (currentPage === 'sobrenosotros.html' || currentPage === 'sobre-nosotros.html') tutorialKey = 'kavariTutorialSobrenosotrosVisto';
  else if (currentPage === 'ayuda.html') tutorialKey = 'kavariTutorialAyudaVisto';
  else if (currentPage === 'contacto.html') tutorialKey = 'kavariTutorialContactoVisto';
  localStorage.setItem(tutorialKey, '1');
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

// ------------------ Inicialización automática ------------------
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => startTutorial(false), 1200);
});
