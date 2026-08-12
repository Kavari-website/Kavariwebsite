// Cambia el color de la barra de navegación cuando haces scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 50));

// Botón de hamburguesa para abrir/cerrar el menú en celulares
document.getElementById('hamburger').addEventListener('click', function(){
  this.classList.toggle('open');
  document.getElementById('navLinks').classList.toggle('open');
});

// Actualiza el contador de cuántos países se están viendo
function updateCount() {
  const visible = document.querySelectorAll('.dest-card:not([style*="display: none"])').length;
  document.getElementById('countVisible').textContent = visible;
}

// Buscador: filtra los países según lo que escribe el usuario
function buscar() {
  const q = document.getElementById('searchInput').value.toLowerCase().trim();
  const cards = document.querySelectorAll('.dest-card');
  let visibles = 0;

  cards.forEach((card) => {
    const nombre = card.dataset.name || '';
    const texto  = card.innerText.toLowerCase();
    const match  = nombre.includes(q) || texto.includes(q);
    
    card.style.animation = 'none';
    
    if (match) {
      if (card.dataset.hideTimeout) {
        clearTimeout(parseInt(card.dataset.hideTimeout));
        card.removeAttribute('data-hide-timeout');
      }
      
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
      if (card.style.display !== 'none' && !card.dataset.hideTimeout) {
        card.style.transition = 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        card.style.opacity = '0';
        card.style.transform = 'translateY(15px) scale(0.95)';
        
        const timeoutId = setTimeout(() => {
          if (card.style.opacity === '0') {
            card.style.display = 'none';
          }
          card.removeAttribute('data-hide-timeout');
        }, 300);
        card.setAttribute('data-hide-timeout', timeoutId);
      }
    }
  });

  const noRes = document.getElementById('noResults');
  document.getElementById('noTerm').textContent = q;
  noRes.style.display = visibles === 0 && q !== '' ? 'flex' : 'none';
  document.getElementById('countVisible').textContent = visibles || 36;
}

// Efecto de aparición cuando haces scroll
const ro = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); ro.unobserve(e.target); } });
}, { threshold: 0.06 });

document.querySelectorAll('.dest-card').forEach((c, i) => {
  c.style.animationDelay = (i * 0.04) + 's';
  ro.observe(c);
});

// Redirige a la página de información del país seleccionado
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

// Sube las tarjetas con like al inicio de la fila (después del label de región)
function orderCardsByLikes() {
  const grid = document.getElementById('destinosGrid');
  if (!grid) return;
  const likes = getLikes();
  const cards = Array.from(grid.querySelectorAll('.dest-card'));
  cards.sort((a, b) => (likes[getPaisCode(b)] || 0) - (likes[getPaisCode(a)] || 0));
  // Reordenar solo las tarjetas, dejando los labels de región en su sitio
  cards.forEach(card => grid.appendChild(card));
  const labels = grid.querySelectorAll('.region-label');
  if (labels.length) {
    grid.insertBefore(labels[0], grid.firstChild);
    for (let i = 1; i < labels.length; i++) {
      grid.insertBefore(labels[i], labels[i - 1].nextSibling);
    }
  }
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

document.addEventListener('DOMContentLoaded', initLikes);

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

// ============================================
// TRADUCCIÓN DE DESCRIPCIONES DE PAÍSES
// ============================================
function aplicarTraduccionesPaises() {
    const destMap = {
        'panama': 'destPanama',
        'colombia': 'destColombia',
        'mexico': 'destMexico',
        'costa-rica': 'destCostaRica',
        'peru': 'destPeru',
        'republica-dominicana': 'destRepublicaDominicana',
        'argentina': 'destArgentina',
        'brasil': 'destBrasil',
        'chile': 'destChile',
        'ecuador': 'destEcuador',
        'cuba': 'destCuba',
        'guatemala': 'destGuatemala',
        'bolivia': 'destBolivia',
        'venezuela': 'destVenezuela',
        'uruguay': 'destUruguay',
        'paraguay': 'destParaguay',
        'honduras': 'destHonduras',
        'nicaragua': 'destNicaragua',
        'el-salvador': 'destElSalvador',
        'belice': 'destBelize',
        'guyana': 'destGuyana',
        'trinidad-y-tobago': 'destTrinidadTobago',
        'jamaica': 'destJamaica',
        'puerto-rico': 'destPuertoRico',
        'bahamas': 'destBahamas',
        'haiti': 'destHaiti',
        'espana': 'destEspana',
        'portugal': 'destPortugal',
        'italia': 'destItalia',
        'francia': 'destFrancia',
        'japon': 'destJapon',
        'tailandia': 'destTailandia',
        'marruecos': 'destMasiaDios',
        'turquia': 'destTurquia',
        'grecia': 'destGrecia',
        'sudafrica': 'destSudafrica'
    };

    document.querySelectorAll('.dest-card').forEach(card => {
        const button = card.querySelector('.dest-btn');
        if (!button) return;

        const onclickAttr = button.getAttribute('onclick') || '';
        const onclickMatch = onclickAttr.match(/irAPais\('([^']+)'\)/);
        if (!onclickMatch) return;

        const pais = onclickMatch[1];
        const key = destMap[pais];
        if (key) {
            const descripcion = card.querySelector('.dest-info p');
            if (descripcion) {
                const traduccion = t(key);
                if (traduccion !== key) {
                    descripcion.textContent = traduccion;
                }
            }
        }
    });
}

// Escuchar cambios de idioma
window.addEventListener('kavari:langchange', function() {
    aplicarTraduccionesPaises();
});

// Al cargar la página, aplicar traducciones
document.addEventListener('DOMContentLoaded', function() {
    aplicarTraduccionesPaises();
});