
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

let top10Data = {};
let paquetesData = {};
window.homeDataLoaded = false;
window.homeDataPromise = null;

const top10ModalKeyMap = {
    'obelisco': 'Obelisco',
    'canal-panama': 'CanalPanama',
    'cristo-redentor': 'Cristo',
    'torres-del-paine': 'TorresPaine',
    'cartagena': 'Cartagena',
    'iguazu': 'Iguazu',
    'machu-picchu': 'MachuPicchu',
    'tikal': 'Tikal',
    'chichen-itza': 'Chichen',
    'galapagos': 'Galapagos'
};

 // Navbar scroll effect
    window.addEventListener('scroll', () => {
      document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });


function getTop10TranslationKey(id) {
    return top10ModalKeyMap[id] || id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

function getPaqueteTranslationKey(id) {
    return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

function getById(id) {
    return document.getElementById(id);
}

function translateOrDefault(key, fallback) {
    if (typeof window.t !== 'function') return fallback;
    const value = window.t(key);
    return value === key ? fallback : value;
}

function getLang() {
    return (typeof window.getIdioma === 'function' ? window.getIdioma() : null) || localStorage.getItem('kavari-idioma') || 'es';
}

function applyI18n(data, i18n) {
    if (!data || !i18n) return data;
    const clone = JSON.parse(JSON.stringify(data));

    function replaceInString(str) {
        if (typeof str !== 'string') return str;
        let result = str;
        for (const [key, val] of Object.entries(i18n)) {
            if (typeof val === 'string') {
                result = result.split(key).join(val);
            }
        }
        return result;
    }

    function walk(obj) {
        if (Array.isArray(obj)) {
            obj.forEach(walk);
        } else if (obj && typeof obj === 'object') {
            for (const [key, val] of Object.entries(obj)) {
                if (Array.isArray(val) && typeof val[0] === 'string') {
                    obj[key] = val.map(replaceInString);
                } else if (val && typeof val === 'object') {
                    walk(val);
                } else if (typeof val === 'string') {
                    obj[key] = replaceInString(val);
                }
            }
        }
    }

    walk(clone);
    return clone;
}

function loadHomeData() {
    if (window.homeDataPromise) return window.homeDataPromise;
    const lang = getLang();
    window.homeDataPromise = fetch('data/data.json', { cache: 'no-cache' })
        .then(res => {
            if (!res.ok) throw new Error('HTTP error! status: ' + res.status);
            return res.json();
        })
        .then(data => {
            return fetch(`data/i18n/${lang}.json`, { cache: 'no-cache' })
                .then(r => r.ok ? r.json() : null)
                .then(i18n => {
                    const translated = applyI18n(data, i18n);
                    top10Data = translated.top10 || {};
                    paquetesData = translated.paquetes || {};
                    window.homeDataLoaded = true;
                    renderHomeCards();
                });
        })
        .catch(error => {
            console.error('Error cargando data de inicio:', error);
            window.homeDataPromise = null;
        });
    return window.homeDataPromise;
}

// ============================================
// RENDER DINÁMICO DE TARJETAS TOP 10 Y PAQUETES
// ============================================
const top10CardKeys = [
    'obelisco', 'canal-panama', 'cristo-redentor', 'torres-del-paine',
    'cartagena', 'iguazu', 'machu-picchu', 'tikal', 'chichen-itza', 'galapagos'
];

// Paquetes: uno por cada país disponible en KAVARI (21 países)
const paqueteCardKeys = [
    'mexico', 'peru', 'panama', 'republica-dominicana', 'brasil',
    'argentina', 'chile', 'costa-rica', 'colombia', 'ecuador',
    'cuba', 'guatemala', 'bolivia', 'venezuela', 'uruguay',
    'paraguay', 'honduras', 'nicaragua', 'el-salvador', 'belice',
    'guyana'
];

// Badge de cada paquete (se traduce con data-i18n)
const paqueteBadgeKeys = {
    'mexico': 'tagPopular',
    'peru': 'tagCultural',
    'panama': 'tagLocal',
    'republica-dominicana': 'tagOferta',
    'brasil': 'tagPopular',
    'argentina': 'tagClasico',
    'chile': 'tagAventura',
    'costa-rica': 'tagAventura',
    'colombia': 'tagCultural',
    'ecuador': 'tagAventura',
    'cuba': 'tagLocal',
    'guatemala': 'tagCultural',
    'bolivia': 'tagAventura',
    'venezuela': 'tagAventura',
    'uruguay': 'tagClasico',
    'paraguay': 'tagCultural',
    'honduras': 'tagOferta',
    'nicaragua': 'tagAventura',
    'el-salvador': 'tagLocal',
    'belice': 'tagOferta',
    'guyana': 'tagAventura'
};

// Región de cada paquete (se traduce con data-i18n)
const paqueteRegionKeys = {
    'mexico': 'regionNorteamerica',
    'peru': 'regionSudamerica',
    'panama': 'regionCentroamerica',
    'republica-dominicana': 'regionCaribe',
    'brasil': 'regionSudamerica',
    'argentina': 'regionSudamerica',
    'chile': 'regionSudamerica',
    'costa-rica': 'regionCentroamerica',
    'colombia': 'regionSudamerica',
    'ecuador': 'regionSudamerica',
    'cuba': 'regionCaribe',
    'guatemala': 'regionCentroamerica',
    'bolivia': 'regionSudamerica',
    'venezuela': 'regionSudamerica',
    'uruguay': 'regionSudamerica',
    'paraguay': 'regionSudamerica',
    'honduras': 'regionCentroamerica',
    'nicaragua': 'regionCentroamerica',
    'el-salvador': 'regionCentroamerica',
    'belice': 'regionCentroamerica',
    'guyana': 'regionSudamerica'
};

// Features de cada paquete (se traducen con data-i18n)
const paqueteFeaturesKeys = {
    'mexico': ['featureVuelo', 'featureHotel4', 'featureDias5', 'featureTours'],
    'peru': ['featureVuelo', 'featureHotel3', 'featureDias4', 'featureGuia'],
    'panama': ['featureTransporte', 'featureHotel4', 'featureDias5', 'featureGuia'],
    'republica-dominicana': ['featureVuelo', 'featureHotel4', 'featureDias5', 'featureActividades'],
    'brasil': ['featureVuelo', 'featureHotel3', 'featureDias6', 'featureTours'],
    'argentina': ['featureVuelo', 'featureHotel4', 'featureDias6', 'featureTours'],
    'chile': ['featureVuelo', 'featureHotel3', 'featureDias6', 'featureGuia'],
    'costa-rica': ['featureTransporte', 'featureHotel3', 'featureDias6', 'featureActividades'],
    'colombia': ['featureVuelo', 'featureHotel3', 'featureDias6', 'featureTours'],
    'ecuador': ['featureTransporte', 'featureHotel4', 'featureDias5', 'featureGuia'],
    'cuba': ['featureHotel4', 'featureDias6', 'featureTraslados', 'featureTours'],
    'guatemala': ['featureTransporte', 'featureHotel3', 'featureDias6', 'featureGuia'],
    'bolivia': ['featureHotel3', 'featureDias5', 'featureTransporte', 'featureGuia'],
    'venezuela': ['featureVuelo', 'featureHotel3', 'featureDias6', 'featureGuia'],
    'uruguay': ['featureHotel3', 'featureDias6', 'featureTraslados', 'featureTours'],
    'paraguay': ['featureHotel3', 'featureDias5', 'featureTransporte', 'featureTours'],
    'honduras': ['featureVuelo', 'featureHotel3', 'featureDias6', 'featureGuia'],
    'nicaragua': ['featureHotel3', 'featureDias6', 'featureTransporte', 'featureActividades'],
    'el-salvador': ['featureHotel3', 'featureDias5', 'featureTraslados', 'featureActividades'],
    'belice': ['featureTransporte', 'featureHotel3', 'featureDias5', 'featureGuia'],
    'guyana': ['featureVuelo', 'featureHotel3', 'featureDias5', 'featureGuia']
};

function renderHomeCards() {
    renderTop10Cards();
    renderPaquetesCards();
}

function renderTop10Cards() {
    const container = document.getElementById('top10Container');
    if (!container || !window.homeDataLoaded) return;
    let html = '';
    top10CardKeys.forEach(id => {
        const d = top10Data[id];
        if (!d) return;
        const translationKey = getTop10TranslationKey(id);
        const title = translateOrDefault('topTitulo' + translationKey, d.title);
        const desc = translateOrDefault('top' + translationKey, d.desc);
        const tagHtml = d.tag ? `<span class="card-tag-pill">${escapeHtml(d.tag)}</span>` : '';
        html += `
            <div class="card reveal">
                <img src="${escapeHtml(d.img)}" alt="${escapeHtml(title)}" loading="lazy" decoding="async">
                ${tagHtml}
                <div class="card-content">
                    <h3>${escapeHtml(title)}</h3>
                    <p>${escapeHtml(desc)}</p>
                    <button class="btn-sabemas" onclick="abrirModalTop10('${id}')" data-i18n="saberMas">Saber más</button>
                </div>
            </div>`;
    });
    container.innerHTML = html;
    // Re-observe new cards for reveal animation
    container.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

function renderPaquetesCards() {
    const container = document.getElementById('paquetesContainer');
    if (!container || !window.homeDataLoaded) return;
    let html = '';
    paqueteCardKeys.forEach(id => {
        const d = paquetesData[id];
        if (!d) return;
        const badgeKey = paqueteBadgeKeys[id] || '';
        const regionKey = paqueteRegionKeys[id] || '';
        const featuresKeys = paqueteFeaturesKeys[id] || [];
        const paqueteKey = getPaqueteTranslationKey(id);
        const title = translateOrDefault('paquete' + paqueteKey + 'Titulo', d.title);
        const desc = translateOrDefault('paquete' + paqueteKey + 'Desc', d.desc);
        const featuresHtml = featuresKeys.map(k => `<span class="paquete-feature" data-i18n="${k}">${translateOrDefault(k, '')}</span>`).join('');
        html += `
            <div class="paquete-card reveal">
                <div class="paquete-img-wrap">
                    <img src="${escapeHtml(d.img)}" alt="${escapeHtml(title)}" loading="lazy" decoding="async">
                    <span class="paquete-badge" data-i18n="${badgeKey}">${translateOrDefault(badgeKey, '')}</span>
                </div>
                <div class="paquete-info">
                    <div class="paquete-region" data-i18n="${regionKey}">${translateOrDefault(regionKey, '')}</div>
                    <h3>${escapeHtml(title)}</h3>
                    <p>${escapeHtml(desc)}</p>
                    <div class="paquete-features">
                        ${featuresHtml}
                    </div>
                    <div class="paquete-bottom">
                        <div class="paquete-precio-wrap">
                            <div class="paquete-desde" data-i18n="desde">Desde</div>
                            <div class="paquete-precio">${escapeHtml(d.precio)}</div>
                            <div class="paquete-pp" data-i18n="porPersona">por persona</div>
                        </div>
                        <div class="paquete-btns">
                            <button class="btn-paquete-info" onclick="abrirModalPaquete('${id}')" data-i18n="verDetalles">Ver detalles</button>
                            <button type="button" class="btn-paquete-reservar" onclick="PackageRequest.open('${id}')" data-i18n="reservarAhora">Reservar ahora</button>
                        </div>
                    </div>
                </div>
            </div>`;
    });
    container.innerHTML = html;
    // Re-observe new cards for reveal animation
    container.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

// Función para abrir el modal del Top 10
async function abrirModalTop10(id) {
    if (!window.homeDataLoaded) await loadHomeData();
    const data = top10Data[id];
    if (!data) return;
    
    // Guardar el ID del modal abierto para poder actualizarlo al cambiar idioma
    window.currentTop10ModalId = id;

    const overlay = getById('top10ModalOverlay');
    if (!overlay) return;

    const imgEl = getById('top10ModalImg');
    const tagEl = getById('top10ModalTag');
    const titleEl = getById('top10ModalTitle');
    const descEl = getById('top10ModalDesc');
    const factsEl = getById('top10ModalFacts');
    const goBtn = getById('top10ModalGoBtn');

    const translationKey = getTop10TranslationKey(id);
    if (imgEl) {
        imgEl.src = data.img;
        imgEl.alt = translateOrDefault('topTitulo' + translationKey, data.title);
    }
    if (tagEl) tagEl.textContent = data.tag;

    if (titleEl) titleEl.textContent = translateOrDefault('topTitulo' + translationKey, data.title);
    if (descEl) descEl.textContent = translateOrDefault('topDesc' + translationKey, data.desc);

    // Chips de datos - parsear desde traducción
    const factsKey = 'topFacts' + translationKey;
    const factString = typeof window.t === 'function' ? window.t(factsKey) : factsKey;
    const facts = factString === factsKey ? data.facts : factString.split('|');
    if (factsEl) {
        factsEl.innerHTML = facts
            .map(f => `<span class="top10-modal-fact">${escapeHtml(f)}</span>`).join('');
    }

    // Botón "Quiero ir" guarda el país y redirige
    if (goBtn) {
        goBtn.onclick = function(e) {
            if (e && e.preventDefault) e.preventDefault();
            localStorage.setItem('paisSeleccionado', data.pais);
            sessionStorage.setItem('kavari-from-index', '1');
            if (window.kavariNavigate) {
                window.kavariNavigate('destino.html');
            } else {
                window.location.href = 'destino.html';
            }
        };
    }

    overlay.classList.add('active');
    if (window.KavariScrollLock) window.KavariScrollLock.lock();
}

function cerrarModalTop10() {
    const el = document.getElementById('top10ModalOverlay');
    if (el) el.classList.remove('active');
    if (window.KavariScrollLock) window.KavariScrollLock.unlock();
}

// Cerrar el modal al hacer clic fuera
const top10Overlay = document.getElementById('top10ModalOverlay');
if (top10Overlay) top10Overlay.addEventListener('click', function(e) {
    if (e.target === this) cerrarModalTop10();
});
const top10Close = document.getElementById('top10ModalClose');
if (top10Close) top10Close.addEventListener('click', cerrarModalTop10);

// Función para abrir el modal de detalle del paquete
async function abrirModalPaquete(id) {
    if (!window.homeDataLoaded) await loadHomeData();
    const data = paquetesData[id];
    if (!data) return;
    
    // Guardar el ID del modal abierto para poder actualizarlo al cambiar idioma
    window.currentPaqueteModalId = id;

    const overlay = getById('paqueteModalOverlay');
    if (!overlay) return;

    const imgEl = getById('paqueteModalImg');
    const titleEl = getById('paqueteModalTitle');
    const precioEl = getById('paqueteModalPrecio');
    const descEl = getById('paqueteModalDesc');
    const includesEl = getById('paqueteModalIncludes');
    const itineraryEl = getById('paqueteModalItinerary');
    const destBtn = getById('paqueteModalDestBtn');

    const paqueteKey = getPaqueteTranslationKey(id);

    if (imgEl) {
        imgEl.src = data.img;
        imgEl.alt = translateOrDefault('paquete' + paqueteKey + 'Titulo', data.title);
    }
    if (titleEl) titleEl.textContent = translateOrDefault('paquete' + paqueteKey + 'Titulo', data.title);
    if (precioEl) precioEl.textContent = data.precio;
    if (descEl) descEl.textContent = translateOrDefault('paquete' + paqueteKey + 'Desc', data.desc);

    if (includesEl) {
        includesEl.innerHTML = data.includes
            .map((item, i) => {
                const translated = translateOrDefault('paquete' + paqueteKey + 'Includes' + i, item);
                return `<div class="paquete-include-item">${escapeHtml(translated)}</div>`;
            }).join('');
    }

    if (itineraryEl) {
        itineraryEl.innerHTML = data.itinerary
            .map((d, i) => {
                const dia = translateOrDefault('paquete' + paqueteKey + 'Itinerario' + i + 'Dia', d.dia);
                const titulo = translateOrDefault('paquete' + paqueteKey + 'Itinerario' + i + 'Titulo', d.titulo);
                const texto = translateOrDefault('paquete' + paqueteKey + 'Itinerario' + i + 'Texto', d.texto);
                return `
                <div class="itinerary-day">
                    <div class="itin-day-num">${escapeHtml(dia)}</div>
                    <div class="itin-day-text">
                        <h5>${escapeHtml(titulo)}</h5>
                        <p>${escapeHtml(texto)}</p>
                    </div>
                </div>`;
            }).join('');
    }

    if (destBtn) {
        destBtn.onclick = function(e) {
            e.preventDefault();
            localStorage.setItem('paisSeleccionado', data.pais);
            sessionStorage.setItem('kavari-from-index', '1');
            if (window.kavariNavigate) {
                window.kavariNavigate('destino.html');
            } else {
                window.location.href = 'destino.html';
            }
        };
    }

    overlay.classList.add('active');
    if (window.KavariScrollLock) window.KavariScrollLock.lock();
}

function cerrarModalPaquete() {
    const el = document.getElementById('paqueteModalOverlay');
    if (el) el.classList.remove('active');
    if (window.KavariScrollLock) window.KavariScrollLock.unlock();
}

const paqOverlay = document.getElementById('paqueteModalOverlay');
if (paqOverlay) paqOverlay.addEventListener('click', function(e) {
    if (e.target === this) cerrarModalPaquete();
});
const paqClose = document.getElementById('paqueteModalClose');
if (paqClose) paqClose.addEventListener('click', cerrarModalPaquete);

// Función auxiliar para preseleccionar el país al ir al listado de paquetes
function seleccionarPais(pais) {
    localStorage.setItem('paisSeleccionado', pais);
}

// Scroll reveal para las tarjetas
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));



// Listener para actualizar modales y tarjetas cuando cambia el idioma
window.addEventListener('kavari:langchange', function(e) {
    const idioma = e.detail.idioma;

    if (window.homeDataLoaded) {
        window.homeDataPromise = null;
        window.homeDataLoaded = false;
        loadHomeData().then(() => {
            if (window.currentTop10ModalId && document.getElementById('top10ModalOverlay').classList.contains('active')) {
                abrirModalTop10(window.currentTop10ModalId);
            }
            if (window.currentPaqueteModalId && document.getElementById('paqueteModalOverlay').classList.contains('active')) {
                abrirModalPaquete(window.currentPaqueteModalId);
            }
        });
    } else {
        if (window.currentTop10ModalId && document.getElementById('top10ModalOverlay').classList.contains('active')) {
            abrirModalTop10(window.currentTop10ModalId);
        }
        if (window.currentPaqueteModalId && document.getElementById('paqueteModalOverlay').classList.contains('active')) {
            abrirModalPaquete(window.currentPaqueteModalId);
        }
    }
});

// Función auxiliar para actualizar el botón de idioma
function updateLangButton(idioma) {
    const btnLang = document.getElementById('btnLang');
    if (btnLang) {
        const langLabel = document.getElementById('langLabel');
        if (langLabel) {
            langLabel.textContent = (idioma || 'es').toUpperCase();
        }
        const orden = ['es', 'en', 'pt', 'fr'];
        const idx = orden.indexOf(idioma);
        const nextIdioma = orden[(idx + 1) % orden.length];
        const ariaLabel = typeof window.t === 'function' ? window.t('ariaCambiarIdioma') : 'Cambiar idioma';
        btnLang.setAttribute('aria-label', ariaLabel + ' (' + nextIdioma.toUpperCase() + ')');
    }
}

// ===== CARRUSEL DE FONDO DEL HERO =====
(function initHeroCarousel() {
    const slides = document.querySelectorAll('.page-index .hero-slide');
    if (!slides.length) return;
    let current = 0;
    const DURACION = 6000;
    setInterval(() => {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    }, DURACION);
})();

// ===== FORMULARIO CTA: SOLICITA TU PLAN DE VIAJE =====
(function initPlanCtaForm() {
    const form = document.getElementById('planCtaForm');
    if (!form) return;
    const msg = document.getElementById('planCtaMsg');
    const btn = document.getElementById('planCtaBtn');

    function marcarError(el, error) {
        if (el) el.classList.toggle('error', error);
    }

    function esEmailValido(valor) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
    }

    function txt(clave, fallback) {
        return typeof window.t === 'function' ? window.t(clave) : fallback;
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const nombre = document.getElementById('planNombre');
        const email = document.getElementById('planEmail');
        const telefono = document.getElementById('planTelefono');
        const destino = document.getElementById('planDestino');
        const fecha = document.getElementById('planFecha');
        const viajeros = document.getElementById('planViajeros');
        const presupuesto = document.getElementById('planPresupuesto');

        marcarError(nombre, !nombre.value.trim());
        marcarError(email, !esEmailValido(email.value.trim()));
        marcarError(telefono, !telefono.value.trim());
        marcarError(destino, !destino.value);
        marcarError(fecha, !fecha.value);
        marcarError(viajeros, !viajeros.value || parseInt(viajeros.value, 10) < 1);
        marcarError(presupuesto, !presupuesto.value);

        if (!nombre.value.trim() || !esEmailValido(email.value.trim()) ||
            !telefono.value.trim() || !destino.value || !fecha.value ||
            !viajeros.value || parseInt(viajeros.value, 10) < 1 || !presupuesto.value) {
            msg.textContent = txt('planCtaError', 'Revisa los campos marcados e inténtalo de nuevo.');
            msg.className = 'plan-cta-msg error';
            return;
        }

        if (btn) btn.disabled = true;
        msg.textContent = txt('planCtaEnviando', 'Enviando…');
        msg.className = 'plan-cta-msg';

        const cliente = window.KavariDB?.getSupabaseClient ? window.KavariDB.getSupabaseClient() : null;
        const enviar = cliente
            ? cliente.from('travel_plans').insert({
                full_name: nombre.value.trim(),
                email: email.value.trim(),
                phone: telefono.value.trim(),
                destination: destino.value,
                travel_date: fecha.value,
                travelers: parseInt(viajeros.value, 10),
                budget_range: presupuesto.value,
                message: (document.getElementById('planMensaje')?.value || '').trim(),
                status: 'pending'
            })
            : Promise.resolve({ error: null, data: null });

        enviar.then(function(res) {
            if (res && res.error) throw res.error;
            msg.textContent = txt('planCtaExito', '¡Gracias! Un asesor te contactará muy pronto.');
            msg.className = 'plan-cta-msg success';
            form.reset();
        }).catch(function(err) {
            console.error('[KAVARI] Error guardando plan de viaje:', err);
            msg.textContent = txt('planCtaFallo', 'No se pudo enviar tu solicitud. Intenta de nuevo.');
            msg.className = 'plan-cta-msg error';
        }).finally(function() {
            if (btn) btn.disabled = false;
        });
    });

    form.querySelectorAll('input, select, textarea').forEach(function(el) {
        el.addEventListener('input', function() { marcarError(el, false); });
        el.addEventListener('change', function() { marcarError(el, false); });
    });
})();

// ===== CARGAR Y RENDERIZAR TARJETAS AL INICIAR =====
loadHomeData();

