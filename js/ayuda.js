/* ============================================
   AYUDA.JS — KAVARI Travel
   Navbar al hacer scroll, menú móvil, acordeón
   de preguntas frecuentes, buscador en vivo,
   expandir/contraer todo, copiar respuesta y
   botón volver arriba.
   ============================================ */

function sincronizarEtiqueta(section) {
  const btn = section.querySelector('.faq-toggle-all');
  if (!btn) return;
  const txt = btn.querySelector('.faq-toggle-text');
  const items = Array.from(section.querySelectorAll('.faq-item')).filter((i) => i.style.display !== 'none');
  const allOpen = items.length > 0 && items.every((i) => i.classList.contains('open'));
  if (txt && window.t) txt.textContent = window.t(allOpen ? 'ayudaContraer' : 'ayudaExpandir');
}

/* ---------- Expandir / contraer todo en una sección ---------- */
function alternarSeccion(btn) {
  const section = btn.closest('.faq-section');
  if (!section) return;
  const items = Array.from(section.querySelectorAll('.faq-item')).filter((i) => i.style.display !== 'none');
  const allOpen = items.length > 0 && items.every((i) => i.classList.contains('open'));
  const target = !allOpen;
  items.forEach((item) => {
    item.classList.toggle('open', target);
    item.querySelector('.faq-question')?.setAttribute('aria-expanded', String(target));
  });
  sincronizarEtiqueta(section);
}

/* ---------- Copiar respuesta de una pregunta ---------- */
function copiarRespuesta(btn) {
  const el = document.getElementById(btn.getAttribute('data-copy-source'));
  if (!el) return;
  const text = (el.querySelector('.faq-answer-text') || el).textContent.trim();

  const mostrarFeedback = function () {
    const label = btn.querySelector('.faq-copy-text');
    if (label) label.textContent = window.t ? window.t('ayudaCopiado') : '¡Copiado!';
    btn.classList.add('copied');
    setTimeout(function () {
      btn.classList.remove('copied');
      if (label) label.textContent = window.t ? window.t('ayudaCopiar') : 'Copiar respuesta';
    }, 1800);
  };

  const copiarFallback = function () {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* noop */ }
    document.body.removeChild(ta);
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(mostrarFeedback).catch(function () {
      copiarFallback();
      mostrarFeedback();
    });
  } else {
    copiarFallback();
    mostrarFeedback();
  }
}

/* ---------- Limpiar búsqueda ---------- */
function limpiarBusqueda() {
  const input = document.getElementById('helpSearch');
  if (input) input.value = '';
  filtrarFAQ();
  if (input) input.focus();
}

/* ---------- Volver arriba ---------- */
function volverArriba() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- Buscador en vivo del centro de ayuda ---------- */
function filtrarFAQ() {
  const input = document.getElementById('helpSearch');
  const noResults = document.getElementById('noResultsFAQ');
  const info = document.getElementById('helpSearchInfo');
  const countEl = document.getElementById('helpSearchCount');
  const wrap = document.getElementById('helpSearchWrap');
  if (!input) return;

  const term = input.value.trim().toLowerCase();
  const sections = document.querySelectorAll('.faq-section');
  let totalVisible = 0;

  if (wrap) wrap.classList.toggle('has-text', term !== '');

  sections.forEach((section) => {
    let visibleInSection = 0;

    section.querySelectorAll('.faq-item').forEach((item) => {
      const questionEl = item.querySelector('.faq-question span[data-i18n]');
      const questionText = questionEl ? questionEl.textContent.toLowerCase() : '';
      const answerEl = item.querySelector('.faq-answer-text');
      const answerText = answerEl ? answerEl.textContent.toLowerCase() : '';
      const matches = term === '' || questionText.includes(term) || answerText.includes(term);

      item.style.display = matches ? '' : 'none';

      if (!matches && item.classList.contains('open')) {
        item.classList.remove('open');
        item.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
      }

      if (matches) visibleInSection++;
    });

    section.style.display = visibleInSection > 0 ? '' : 'none';
    totalVisible += visibleInSection;
    sincronizarEtiqueta(section);
  });

  if (noResults) noResults.style.display = totalVisible === 0 ? '' : 'none';

  if (info && countEl) {
    if (term !== '' && totalVisible > 0) {
      info.hidden = false;
      countEl.textContent = totalVisible + ' ' + (window.t ? window.t('ayudaResultados') : 'preguntas encontradas');
    } else {
      info.hidden = true;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Navbar: fondo sólido al hacer scroll ---------- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (!navbar) return;
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Acordeón de preguntas frecuentes ---------- */
  document.querySelectorAll('.faq-item').forEach((item) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('open', !isOpen);
      question.setAttribute('aria-expanded', String(!isOpen));
      document.querySelectorAll('.faq-section').forEach(sincronizarEtiqueta);
    });
  });

  /* ---------- Scroll suave: categorías y chips ---------- */
  document.querySelectorAll('.help-cat-card[href^="#"], .help-chip[href^="#"]').forEach((card) => {
    card.addEventListener('click', (e) => {
      const targetId = card.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      const offset = 100;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---------- Botón volver arriba ---------- */
  const backTop = document.getElementById('backTop');
  if (backTop) {
    const onScrollBT = () => backTop.classList.toggle('show', window.scrollY > 600);
    onScrollBT();
    window.addEventListener('scroll', onScrollBT, { passive: true });
  }

  /* ---------- Re-sincronizar etiquetas al cambiar de idioma ---------- */
  window.addEventListener('kavari:langchange', () => {
    document.querySelectorAll('.faq-section').forEach(sincronizarEtiqueta);
  });

});