// Cambia el color de la barra de navegación cuando haces scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 50));

// El botón de hamburguesa lo controla mobile-nav.js (evita doble toggle
// que hacía que el menú se abriera y cerrara en el mismo clic).

// ============================================
// RENDER DE LOS 21 DESTINOS (desde KAVARI_PAISES)
// ============================================
const PAISES = window.KAVARI_PAISES || [];

const REGION_LABEL_KEYS = {
  latam: 'paisesRegionLatam',
  europa: 'paisesRegionEuropa',
  asia: 'paisesRegionAsia'
};

// Badges decorativos (traducibles) por país
const PAIS_BADGES = {
  'panama': 'badgeGuiaDisponible',
  'colombia': 'badgePopular',
  'mexico': 'badgeTrending',
  'peru': 'badgePatrimonioUNESCO',
  'ecuador': 'badgePatrimonioUNESCO',
  'republica-dominicana': 'badgeParaiso'
};

function getLang() {
  const l = localStorage.getItem('kavari-idioma') || 'es';
  return ['es', 'en', 'pt'].includes(l) ? l : 'es';
}

// Busca el texto traducido de una clave (con respaldo seguro)
function tClave(clave) {
  try {
    const trad = window.t(clave);
    return (trad && trad !== clave) ? trad : clave;
  } catch (e) {
    return clave;
  }
}

// Texto por idioma con respaldo al español
function txt(obj, lang) {
  if (!obj) return '';
  return obj[lang] || obj.es || '';
}

// Construye el HTML de una tarjeta de destino
function buildCardHTML(p, lang, idx) {
  const nombre = txt(p.nombre, lang);
  const desc = txt(p.desc, lang);
  const epoca = txt(p.epoca, lang);
  const idioma = txt(p.idioma, lang);
  const moneda = txt(p.moneda, lang);
  const badgeKey = PAIS_BADGES[p.code];
  const badgeHTML = badgeKey ? `<div class="thumb-badge">${tClave(badgeKey)}</div>` : '';

  // Palabras buscables: nombre (ES/EN/PT), descripción, continente, idioma y moneda
  const nombreEn = txt(p.nombre, 'en');
  const nombrePt = txt(p.nombre, 'pt');
  const buscaNombre = txt(p.nombre, 'es');
  const buscaContinentes = (p.continentes || []).map(c => {
    const key = 'paisesContinente' + c.charAt(0).toUpperCase() + c.slice(1);
    return tClave(key);
  }).join(' ');
  const buscaTexto = [nombre, nombreEn, nombrePt, buscaNombre, buscaContinentes, desc, idioma, moneda].join(' ').toLowerCase();

  // Alt descriptivo con el nombre + un atractivo del destino (SEO)
  const atractivo = (desc.split('.')[0] || nombre).trim();
  const alt = `${nombre}: ${atractivo}`.slice(0, 110);

  // Las primeras tarjetas cargan su imagen con prioridad (mejor LCP);
  // el resto en diferido para que la página se vea antes.
  const imgAttrs = idx < 4 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
  return `
    <article class="dest-card kv-v2" data-name="${buscaTexto.replace(/"/g, '&quot;')}" data-continent="${(p.continentes || []).join(',')}" style="animation-delay:${Math.min(idx * 0.05, 0.45)}s">
      <div class="dest-thumb">
        <img src="${p.img}" alt="${alt}" ${imgAttrs} decoding="async"/>
        <div class="dest-shade"></div>
        ${badgeHTML}
        <h3 class="dest-title">${nombre}</h3>
      </div>
      <div class="dest-info">
        <p class="dest-desc">${desc}</p>
        <div class="dest-meta">
          <span class="dest-meta-item" title="${tClave('paisesTagEpoca')}"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>${epoca}</span>
          <span class="dest-meta-item" title="${tClave('paisesTagIdioma')}"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>${idioma}</span>
          <span class="dest-meta-item" title="${tClave('paisesTagMoneda')}"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>${moneda}</span>
        </div>
        <button type="button" class="dest-btn" onclick="irAPais('${p.code}')">${tClave('paisesVerDestino')}<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
      </div>
    </article>`;
}

// Renderiza todas las tarjetas agrupadas por región (secciones con contador)
function renderPaises() {
  const grid = document.getElementById('destinosGrid');
  if (!grid) return;
  const lang = getLang();
  const orden = ['latam', 'europa', 'asia'];
  let html = '';

  orden.forEach(reg => {
    const items = PAISES.filter(p => p.region === reg);
    if (!items.length) return;
    html += `
      <section class="region-block" data-region="${reg}">
        <header class="region-head">
          <h2 class="region-title">${tClave(REGION_LABEL_KEYS[reg])}</h2>
          <span class="region-count">${items.length}</span>
          <span class="region-line" aria-hidden="true"></span>
        </header>
        <div class="region-grid">`;
    items.forEach((p, i) => { html += buildCardHTML(p, lang, i); });
    html += `</div>
      </section>`;
  });

  grid.innerHTML = html;
  aplicarBadgesGuias();
  buscar();
  initLikes();
}

// ============================================
// MENSAJE "CARGANDO DESTINOS..." MIENTRAS SE RENDERIZA
// ============================================
function ocultarCargando() {
  const l = document.getElementById('destinosLoading');
  if (!l) return;
  l.classList.add('oculto');
  setTimeout(() => { l.style.display = 'none'; }, 400);
}

// ============================================
// BADGES DE GUÍAS DISPONIBLES (por país)
// ============================================
function aplicarBadgesGuias() {
  let guides = [];
  try { guides = JSON.parse(localStorage.getItem('kavariGuides')) || []; } catch (e) { guides = []; }
  if (!guides.length) return;
  document.querySelectorAll('.dest-card').forEach(card => {
    const btn = card.querySelector('.dest-btn');
    if (!btn) return;
    const m = (btn.getAttribute('onclick') || '').match(/irAPais\('([^']+)'\)/);
    if (!m) return;
    const code = m[1];
    const countryGuides = guides.filter(g => g.country === code);
    if (!countryGuides.length) return;
    const n = countryGuides.length;
    const L = getLang();
    const w = (n === 1 ? (L === 'en' ? 'guide' : L === 'pt' ? 'guia' : 'guía') : (L === 'en' ? 'guides' : L === 'pt' ? 'guias' : 'guías'));
    const txtBadge = n + ' ' + w;
    let badge = card.querySelector('.thumb-badge');
    if (badge) badge.textContent = txtBadge;
    else {
      const b = document.createElement('div');
      b.className = 'thumb-badge';
      b.textContent = txtBadge;
      const thumb = card.querySelector('.dest-thumb');
      if (thumb) thumb.appendChild(b);
    }
  });
}

// ============================================
// FILTRO: por nombre de país O continente
// ============================================
function updateCount() {
  const visibles = document.querySelectorAll('.dest-card:not([style*="display: none"])').length;
  document.getElementById('countVisible').textContent = visibles;
}

// Oculta las etiquetas de región cuyas tarjetas estén todas filtradas
function updateRegionLabels() {
  // Estructura nueva: secciones .region-block con su propio grid
  const bloques = document.querySelectorAll('.region-block');
  if (bloques.length) {
    bloques.forEach(bloque => {
      const visibles = [...bloque.querySelectorAll('.dest-card')]
        .filter(c => c.style.display !== 'none').length;
      bloque.style.display = visibles ? '' : 'none';
      const count = bloque.querySelector('.region-count');
      if (count) count.textContent = visibles;
    });
    return;
  }
  // Compatibilidad con estructura plana antigua
  document.querySelectorAll('.region-label').forEach(label => {
    let el = label.nextElementSibling;
    let visible = false;
    while (el && !el.classList.contains('region-label')) {
      if (el.classList.contains('dest-card') && el.style.display !== 'none') { visible = true; break; }
      el = el.nextElementSibling;
    }
    label.style.display = visible ? '' : 'none';
  });
}

// Cambia el filtro de continente desde los chips (mantiene el select oculto como estado)
function setContinent(valor) {
  const select = document.getElementById('continentFilter');
  if (select) select.value = valor;
  document.querySelectorAll('.continent-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.continent === valor);
  });
  buscar();
}

function buscar() {
  const q = (document.getElementById('searchInput').value || '').toLowerCase().trim();
  const cont = (document.getElementById('continentFilter').value || 'todos');
  const cards = document.querySelectorAll('.dest-card');
  let visibles = 0;

  cards.forEach(card => {
    const nombre = (card.dataset.name || '').toLowerCase();
    const conts = (card.dataset.continent || '').split(',');
    const matchQ = !q || nombre.includes(q);
    const matchC = cont === 'todos' || conts.includes(cont);

    card.style.animation = 'none';
    if (matchQ && matchC) {
      if (card.style.display === 'none') {
        card.style.display = '';
        card.style.opacity = '0';
        card.style.transform = 'translateY(15px) scale(0.95)';
        card.offsetHeight;
      }
      card.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0) scale(1)';
      visibles++;
    } else {
      if (card.style.display !== 'none') {
        card.style.transition = 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        card.style.opacity = '0';
        card.style.transform = 'translateY(15px) scale(0.95)';
        setTimeout(() => {
          if (card.style.opacity === '0') card.style.display = 'none';
        }, 300);
      }
    }
  });

  document.getElementById('countVisible').textContent = visibles;
  updateRegionLabels();
}

// ============================================
// LIKES DE PAÍSES (persistidos por usuario en Supabase)
// ============================================
function irAPais(codigoPais) {
  localStorage.setItem('paisSeleccionado', codigoPais);
  if (window.kavariNavigate) {
    window.kavariNavigate('destino.html');
  } else {
    window.location.href = 'destino.html';
  }
}

// ============================================
// LIKES DE PAÍSES (persistidos por usuario en Supabase)
// ============================================
const LIKES_KEY = 'kavari-pais-likes';
const LIKES_TIME_KEY = 'kavari-pais-likes-time';

function getPaisCode(card) {
  const btn = card.querySelector('.dest-btn');
  if (!btn) return null;
  const m = (btn.getAttribute('onclick') || '').match(/irAPais\('([^']+)'\)/);
  return m ? m[1] : null;
}

function getLikes() {
  try { return JSON.parse(localStorage.getItem(LIKES_KEY)) || {}; } catch (_) { return {}; }
}

function saveLikes(likes) {
  try { localStorage.setItem(LIKES_KEY, JSON.stringify(likes)); } catch (_) { /* noop */ }
}

/* Timestamps (fecha del like) para el orden "Más reciente" del perfil */
function getLikesTimes() {
  try { return JSON.parse(localStorage.getItem(LIKES_TIME_KEY)) || {}; } catch (_) { return {}; }
}

function saveLikesTimes(times) {
  try { localStorage.setItem(LIKES_TIME_KEY, JSON.stringify(times)); } catch (_) { /* noop */ }
}

/* Usuario actual (Supabase o local) para asociar los likes a su cuenta */
async function getCurrentUserId() {
  try {
    if (window.KavariDB && typeof window.KavariDB.getCurrentUser === 'function') {
      const user = await window.KavariDB.getCurrentUser();
      if (user && user.id) return user.id;
    }
  } catch (_) { /* noop */ }
  return null;
}

/* Carga los likes del usuario desde Supabase y actualiza la vista */
async function syncLikesFromServer() {
  const userId = await getCurrentUserId();
  if (!userId) return;
  try {
    if (window.KavariAuth && typeof window.KavariAuth.getUserLikesWithTime === 'function') {
      const rows = await window.KavariAuth.getUserLikesWithTime(userId);
      const likes = {};
      const times = {};
      (rows || []).forEach(r => {
        likes[r.pais_code] = 1;
        if (r.created_at) times[r.pais_code] = Date.parse(r.created_at);
      });
      saveLikes(likes);
      saveLikesTimes(times);
    } else if (window.KavariAuth && typeof window.KavariAuth.getUserLikes === 'function') {
      const codes = await window.KavariAuth.getUserLikes(userId);
      const likes = {};
      codes.forEach(code => { likes[code] = 1; });
      saveLikes(likes);
    }
  } catch (_) { /* noop */ }
}

/* Guarda (o quita) un like en Supabase si hay sesión. Al dar like,
   sincroniza la fecha local con la fecha REAL de la cuenta (created_at
   que Supabase registró), para que "Más reciente" use siempre la fecha
   del servidor y no la del reloj del navegador. */
async function persistLikeToServer(code, liked) {
  const userId = await getCurrentUserId();
  if (!userId) return;
  try {
    if (window.KavariAuth && typeof window.KavariAuth.setUserLike === 'function') {
      const result = await window.KavariAuth.setUserLike(userId, code, liked);
      if (result && result.ok && result.created_at) {
        const times = getLikesTimes();
        times[code] = Date.parse(result.created_at);
        saveLikesTimes(times);
      }
    }
  } catch (e) {
    console.warn('[KAVARI] No se pudo sincronizar el like con la cuenta:', e);
  }
}

// Sube las tarjetas con like al inicio DENTRO de su sección de región
// (respeta la estructura .region-block > .region-grid > .dest-card.kv-v2)
function orderCardsByLikes() {
  const grids = document.querySelectorAll('.region-grid');
  if (!grids.length) {
    // Compatibilidad con estructura plana antigua
    const grid = document.getElementById('destinosGrid');
    if (!grid) return;
    const likes0 = getLikes();
    const cards0 = Array.from(grid.querySelectorAll('.dest-card'));
    cards0.sort((a, b) => (likes0[getPaisCode(b)] || 0) - (likes0[getPaisCode(a)] || 0));
    cards0.forEach(card => grid.appendChild(card));
    return;
  }
  const likes = getLikes();
  grids.forEach(rg => {
    const cards = Array.from(rg.querySelectorAll(':scope > .dest-card'));
    cards.sort((a, b) => (likes[getPaisCode(b)] || 0) - (likes[getPaisCode(a)] || 0));
    cards.forEach(card => rg.appendChild(card)); // reordena dentro de su región
  });
}

function updateLikeBtn(btn, count) {
  const liked = count > 0;
  btn.classList.toggle('liked', liked);
  const num = btn.querySelector('.dest-like-count');
  if (num) num.textContent = count || '';
  btn.setAttribute('aria-label', liked ? 'Quitar like' : 'Me gusta');
}

function toggleLike(card) {
  const code = getPaisCode(card);
  if (!code) return;
  const likes = getLikes();
  const count = likes[code] || 0;
  const liked = count === 0;
  const times = getLikesTimes();
  if (liked) {
    likes[code] = 1;
    times[code] = Date.now();
  } else {
    delete likes[code];
    delete times[code];
  }
  saveLikes(likes);
  saveLikesTimes(times);
  persistLikeToServer(code, liked); // sincronizar con la cuenta (Supabase)
  const btn = card.querySelector('.dest-like');
  if (btn) updateLikeBtn(btn, likes[code] || 0);
  card.classList.remove('like-bump');
  void card.offsetWidth; // reinicia la animación
  card.classList.add('like-bump');
  orderCardsByLikes();
}

function refreshLikesUI() {
  const likes = getLikes();
  document.querySelectorAll('.dest-card').forEach(card => {
    const code = getPaisCode(card);
    const btn = card.querySelector('.dest-like');
    if (code && btn) updateLikeBtn(btn, likes[code] || 0);
  });
  orderCardsByLikes();
}

function initLikes() {
  const likes = getLikes();
  document.querySelectorAll('.dest-card').forEach(card => {
    const code = getPaisCode(card);
    if (!code) return;
    const thumb = card.querySelector('.dest-thumb');
    if (!thumb) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dest-like';
    btn.setAttribute('aria-label', 'Me gusta');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-8-4.9-8-11a4.6 4.6 0 0 1 8-3.2A4.6 4.6 0 0 1 20 10c0 6.1-8 11-8 11z"/></svg><span class="dest-like-count"></span>';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleLike(card);
    });
    thumb.appendChild(btn);
    updateLikeBtn(btn, likes[code] || 0);
  });
  orderCardsByLikes();
  // Si hay sesión, cargar los likes guardados de la cuenta
  syncLikesFromServer();
}

// Al iniciar sesión: cargar likes de la cuenta · Al cerrar sesión: limpiar locales
window.addEventListener('kavari:authchange', function (e) {
  if (e.detail && e.detail.user) {
    syncLikesFromServer();
  } else {
    localStorage.removeItem(LIKES_KEY);
    localStorage.removeItem(LIKES_TIME_KEY);
    refreshLikesUI();
  }
});

// Re-renderizar al cambiar de idioma (en el siguiente frame, para que los
// textos estáticos se pinten primero y el cambio no se sienta pesado)
window.addEventListener('kavari:langchange', function () {
  requestAnimationFrame(renderPaises);
});

// ============================================
// INICIO: mostrar "Cargando destinos..." y renderizar
// ============================================
requestAnimationFrame(function () {
  renderPaises();
  ocultarCargando();
});