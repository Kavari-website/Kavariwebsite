
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

const paqueteModalKeyMap = {
    'francia': 'Francia',
    'china': 'China',
    'india': 'India',
    'italia': 'Italia',
    'panama': 'Panama',
    'el-salvador': 'ElSalvador'
};
 // Navbar scroll effect
    window.addEventListener('scroll', () => {
      document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });


function getTop10TranslationKey(id) {
    return top10ModalKeyMap[id] || id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

function getPaqueteTranslationKey(id) {
    return paqueteModalKeyMap[id] || id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

function getById(id) {
    return document.getElementById(id);
}

function translateOrDefault(key, fallback) {
    if (typeof t !== 'function') return fallback;
    const value = t(key);
    return value === key ? fallback : value;
}

function loadHomeData() {
    if (window.homeDataPromise) return window.homeDataPromise;
    window.homeDataPromise = fetch('data/data.json', { cache: 'no-cache' })
        .then(res => res.json())
        .then(data => {
            top10Data = data.top10 || {};
            paquetesData = data.paquetes || {};
            window.homeDataLoaded = true;
            renderHomeCards();
        })
        .catch(error => {
            console.error('Error cargando data de inicio:', error);
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

const paqueteCardKeys = [
    'francia', 'china', 'india', 'italia', 'panama', 'el-salvador'
];

// Badge de cada paquete (se traduce con data-i18n)
const paqueteBadgeKeys = {
    'francia': 'tagPopular',
    'china': 'tagAventura',
    'india': 'tagCultural',
    'italia': 'tagClasico',
    'panama': 'tagLocal',
    'el-salvador': 'tagOferta'
};

// Región de cada paquete (se traduce con data-i18n)
const paqueteRegionKeys = {
    'francia': 'regionEuropa',
    'china': 'regionAsia',
    'india': 'regionAsia',
    'italia': 'regionEuropa',
    'panama': 'regionCentroamerica',
    'el-salvador': 'regionCentroamerica'
};

// Features de cada paquete (se traducen con data-i18n)
const paqueteFeaturesKeys = {
    'francia': ['featureVuelo', 'featureHotel4', 'featureDias8', 'featureGuia'],
    'china': ['featureVuelo', 'featureHotel4', 'featureDias10', 'featureTransporte'],
    'india': ['featureVuelo', 'featureHotel3', 'featureDias9', 'featureGuia'],
    'italia': ['featureVuelo', 'featureHotel4', 'featureDias9', 'featureTours'],
    'panama': ['featureTransporte', 'featureHotel4', 'featureDias5', 'featureGuia'],
    'el-salvador': ['featureTraslados', 'featureHotel3', 'featureDias4', 'featureActividades']
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
        const tagHtml = d.tag ? `<span class="card-tag-pill">${d.tag}</span>` : '';
        html += `
            <div class="card reveal">
                <img src="${d.img}" alt="${title}" loading="lazy" decoding="async">
                ${tagHtml}
                <div class="card-content">
                    <h3>${title}</h3>
                    <p>${desc}</p>
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
                    <img src="${d.img}" alt="${title}" loading="lazy" decoding="async">
                    <span class="paquete-badge" data-i18n="${badgeKey}">${translateOrDefault(badgeKey, '')}</span>
                </div>
                <div class="paquete-info">
                    <div class="paquete-region" data-i18n="${regionKey}">${translateOrDefault(regionKey, '')}</div>
                    <h3>${title}</h3>
                    <p>${desc}</p>
                    <div class="paquete-features">
                        ${featuresHtml}
                    </div>
                    <div class="paquete-bottom">
                        <div class="paquete-precio-wrap">
                            <div class="paquete-desde" data-i18n="desde">Desde</div>
                            <div class="paquete-precio">${d.precio}</div>
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

    if (imgEl) {
        imgEl.src = data.img;
        imgEl.alt = data.title;
    }
    if (tagEl) tagEl.textContent = data.tag;

    const translationKey = getTop10TranslationKey(id);
    if (titleEl) titleEl.textContent = translateOrDefault('topTitulo' + translationKey, data.title);
    if (descEl) descEl.textContent = translateOrDefault('topDesc' + translationKey, data.desc);

    // Chips de datos - parsear desde traducción
    const factsKey = 'topFacts' + translationKey;
    const factString = typeof t === 'function' ? t(factsKey) : factsKey;
    const facts = factString === factsKey ? data.facts : factString.split('|');
    if (factsEl) {
        factsEl.innerHTML = facts
            .map(f => `<span class="top10-modal-fact">${f}</span>`).join('');
    }

    // Botón "Quiero ir" guarda el país y redirige
    if (goBtn) {
        goBtn.onclick = function(e) {
            if (e && e.preventDefault) e.preventDefault();
            localStorage.setItem('paisSeleccionado', data.pais);
            if (window.kavariNavigate) {
                window.kavariNavigate('destino.html');
            } else {
                window.location.href = 'destino.html';
            }
        };
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function cerrarModalTop10() {
    document.getElementById('top10ModalOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

// Cerrar el modal al hacer clic fuera
document.getElementById('top10ModalOverlay').addEventListener('click', function(e) {
    if (e.target === this) cerrarModalTop10();
});
document.getElementById('top10ModalClose').addEventListener('click', cerrarModalTop10);

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

    if (imgEl) {
        imgEl.src = data.img;
        imgEl.alt = data.title;
    }
    if (titleEl) titleEl.textContent = data.title;
    if (precioEl) precioEl.innerHTML = data.precio;

    const paqueteKey = getPaqueteTranslationKey(id);
    if (descEl) descEl.textContent = translateOrDefault('paquete' + paqueteKey + 'Desc', data.desc);

    if (includesEl) {
        includesEl.innerHTML = data.includes
            .map(item => `<div class="paquete-include-item">${item}</div>`).join('');
    }

    if (itineraryEl) {
        itineraryEl.innerHTML = data.itinerary
            .map(d => `
                <div class="itinerary-day">
                    <div class="itin-day-num">${d.dia.split(' ')[1]}</div>
                    <div class="itin-day-text">
                        <h5>${d.titulo}</h5>
                        <p>${d.texto}</p>
                    </div>
                </div>
            `).join('');
    }

    if (destBtn) {
        destBtn.onclick = function(e) {
            e.preventDefault();
            localStorage.setItem('paisSeleccionado', data.pais);
            if (window.kavariNavigate) {
                window.kavariNavigate('destino.html');
            } else {
                window.location.href = 'destino.html';
            }
        };
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function cerrarModalPaquete() {
    document.getElementById('paqueteModalOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

document.getElementById('paqueteModalOverlay').addEventListener('click', function(e) {
    if (e.target === this) cerrarModalPaquete();
});
document.getElementById('paqueteModalClose').addEventListener('click', cerrarModalPaquete);

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
    
    // Re-renderizar tarjetas del home con el nuevo idioma
    if (window.homeDataLoaded) renderHomeCards();
    
    // Si hay un modal de Top 10 abierto, actualizarlo
    if (window.currentTop10ModalId && document.getElementById('top10ModalOverlay').classList.contains('active')) {
        abrirModalTop10(window.currentTop10ModalId);
    }
    
    // Si hay un modal de paquete abierto, actualizarlo
    if (window.currentPaqueteModalId && document.getElementById('paqueteModalOverlay').classList.contains('active')) {
        abrirModalPaquete(window.currentPaqueteModalId);
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
        const orden = ['es', 'en', 'pt'];
        const idx = orden.indexOf(idioma);
        const nextIdioma = orden[(idx + 1) % orden.length];
        btnLang.setAttribute('aria-label', 'Cambiar a ' + nextIdioma.toUpperCase());
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
        return typeof t === 'function' ? t(clave) : fallback;
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

