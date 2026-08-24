// destino.js — Lógica de renderizado y carga de datos
// Depende de idioma.js (window.t, window.toggleLang) y theme.js

// ============================================================
// 1. VARIABLES GLOBALES
// ============================================================
let countryData = {};
let guiasPanama = [];
let souvenirsTiendas = [];
let aerolineasData = [];
let hospedajesData = [];
let currentCountryCode = 'panama';
let currentGuideFilter = 'all';
let datosGlobales = null;
let allCountries = [];
let countryOptionsInitialized = false;

// ============================================================
// 2. FUNCIÓN AUXILIAR DE TRADUCCIÓN (MEJORADA)
// ============================================================
function _t(valor) {
    if (typeof valor === 'string') {
        const traducido = window.t(valor);
        return traducido !== valor ? traducido : valor;
    }
    return valor;
}

// ============================================================
// 2b. RESOLVER NOMBRE DE PAÍS (slug → paisX_nombre)
// ============================================================
const PAIS_NOMBRE_KEY = {
    panama: 'paisPanama_nombre', colombia: 'paisColombia_nombre', mexico: 'paisMexico_nombre',
    'costa-rica': 'paisCostaRica_nombre', peru: 'paisPeru_nombre', 'republica-dominicana': 'paisRepublicaDominicana_nombre',
    argentina: 'paisArgentina_nombre', brasil: 'paisBrasil_nombre', chile: 'paisChile_nombre',
    ecuador: 'paisEcuador_nombre', cuba: 'paisCuba_nombre', guatemala: 'paisGuatemala_nombre',
    bolivia: 'paisBolivia_nombre', venezuela: 'paisVenezuela_nombre', uruguay: 'paisUruguay_nombre',
    paraguay: 'paisParaguay_nombre', honduras: 'paisHonduras_nombre', nicaragua: 'paisNicaragua_nombre',
    'el-salvador': 'paisElSalvador_nombre', belice: 'paisBelice_nombre', guyana: 'paisGuyana_nombre',
    'trinidad-y-tobago': 'paisTrinidadTobago_nombre', jamaica: 'paisJamaica_nombre', 'puerto-rico': 'paisPuertoRico_nombre',
    bahamas: 'paisBahamas_nombre', haiti: 'paisHaiti_nombre', espana: 'paisEspana_nombre',
    portugal: 'paisPortugal_nombre', italia: 'paisItalia_nombre', francia: 'paisFrancia_nombre',
    japon: 'paisJapon_nombre', tailandia: 'paisTailandia_nombre', marruecos: 'paisMarruecos_nombre',
    turquia: 'paisTurquia_nombre', grecia: 'paisGrecia_nombre', sudafrica: 'paisSudafrica_nombre'
};

function nombrePais(slug, fallback) {
    const key = PAIS_NOMBRE_KEY[slug];
    if (key) {
        const tr = _t(key);
        return tr !== key ? tr : fallback;
    }
    return fallback;
}

// ============================================================
// 3. FUNCIONES AUXILIARES DE DATOS (sin cambios)
// ============================================================
function getDefaultGuides() {
    return [
        { id: 1, name: "Mariana Estévez", description: "Especialista en turismo sostenible y avistamiento de aves.", languages: "Español, Inglés, Francés", location: "Bocas del Toro", country: "panama", rank: "diamond", price: 50, photo: "https://randomuser.me/api/portraits/women/68.jpg", especialidades: ["Ecoturismo", "Aves", "Naturaleza"], disponible: true },
        { id: 2, name: "Ricardo Herrera", description: "Historiador urbano y guía de patrimonio colonial.", languages: "Español, Portugués, Italiano", location: "Cartagena", country: "colombia", rank: "diamond", price: 50, photo: "https://randomuser.me/api/portraits/men/32.jpg", especialidades: ["Historia", "Arquitectura", "Arte"], disponible: true },
        { id: 3, name: "Camila Rojas", description: "Recorridos por fincas cafeteras y senderismo de montaña.", languages: "Español, Inglés", location: "Quindío", country: "colombia", rank: "gold", price: 35, photo: "https://randomuser.me/api/portraits/women/45.jpg", especialidades: ["Café", "Senderismo", "Naturaleza"], disponible: true },
        { id: 4, name: "Jorge Lasso", description: "Experiencias culturales nocturnas y gastronomía local.", languages: "Español, Inglés", location: "Ciudad de Guatemala", country: "guatemala", rank: "gold", price: 35, photo: "https://randomuser.me/api/portraits/men/79.jpg", especialidades: ["Cultura", "Gastronomía", "Historia"], disponible: false },
        { id: 5, name: "Laura Villanueva", description: "Guía de aventura y rafting en ríos de montaña.", languages: "Español, Inglés", location: "La Fortuna", country: "costa-rica", rank: "silver", price: 20, photo: "https://randomuser.me/api/portraits/women/22.jpg", especialidades: ["Aventura", "Rafting", "Senderismo"], disponible: true },
        { id: 6, name: "Carlos Mejía", description: "Experto en el Canal de Panamá e historia colonial.", languages: "Español, Inglés", location: "Ciudad de Panamá", country: "panama", rank: "gold", price: 35, photo: "https://randomuser.me/api/portraits/men/55.jpg", especialidades: ["Canal", "Historia", "Cultura"], disponible: true },
        { id: 7, name: "Isabella Romano", description: "Historiadora del arte especializada en Roma y el Vaticano.", languages: "Español, Italiano, Francés", location: "Roma", country: "italia", rank: "diamond", price: 50, photo: "https://randomuser.me/api/portraits/women/33.jpg", especialidades: ["Arte", "Arquitectura", "Historia"], disponible: true },
        { id: 8, name: "Hiroshi Tanaka", description: "Guía entre culturas con experiencia en Japón.", languages: "Español, Japonés, Inglés", location: "Tokio", country: "japon", rank: "diamond", price: 50, photo: "https://randomuser.me/api/portraits/men/88.jpg", especialidades: ["Cultura", "Templos", "Gastronomía"], disponible: true }
    ];
}

function loadGuidesForCountry(countryCode, dataGuides) {
    const fromData = dataGuides || [];
    let fromStorage = [];
    try {
        const stored = JSON.parse(localStorage.getItem('kavariGuides') || '[]');
        fromStorage = stored.filter(g => g.country === countryCode);
    } catch (e) { /* ignore */ }
    const ids = new Set(fromData.map(g => g.id));
    let merged = [...fromData, ...fromStorage.filter(g => !ids.has(g.id))];
    if (merged.length === 0) {
        merged = getDefaultGuides().filter(g => g.country === countryCode);
    }
    return merged;
}

const GUIDE_PRICES = { diamond: 50, gold: 35, silver: 20 };

function isDemoGuide(g) {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9001, 9002].includes(Number(g.id));
}

async function loadApprovedGuidesFromSupabase(countryCode) {
    if (!window.KavariAuth || !window.KavariDB) return [];
    try {
        const rows = await window.KavariAuth.getGuidesByCountry(countryCode);
        return (rows || []).map(row => ({
            id: row.id,
            name: row.full_name,
            description: row.description || '',
            languages: row.languages || '',
            location: '',
            country: row.country_code,
            rank: (row.membership_tier || 'silver'),
            price: GUIDE_PRICES[row.membership_tier] || 20,
            photo: row.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.full_name || 'G')}&background=0050a0&color=fff`,
            phone: row.phone || '',
            email: row.email || '',
            disponible: true,
            especialidades: String(row.specialties || '').split(',').map(s => s.trim()).filter(Boolean)
        }));
    } catch (e) {
        console.warn('[KAVARI] No se pudieron cargar guías de Supabase:', e);
        return [];
    }
}

function mergeGuideSources(localList, remoteList) {
    const seen = new Set(localList.map(g => (g.email || '').toLowerCase()).filter(Boolean));
    const merged = [...localList];
    remoteList.forEach(g => {
        const key = (g.email || '').toLowerCase();
        if (!key || seen.has(key)) {
            if (!key) merged.push(g);
            return;
        }
        seen.add(key);
        merged.push(g);
    });
    return merged;
}

function enrichCountryData(codigo, d) {
    if (!d) return d;
    const capital = d.capital || d.nombre;
    const destino = d.nombre;

    if (!d.aerolineas || d.aerolineas.length === 0) {
        d.aerolineas = [
            { id: 1, nombre: 'Copa Airlines', iata: 'CM', descripcion: `Conexiones regionales hacia ${destino}.`, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Copa_Airlines_logo.svg/320px-Copa_Airlines_logo.svg.png', precio_desde: 180, moneda: 'USD', clase: 'Económica', url_reserva: 'https://www.copaair.com', origen_referencia: 'Latinoamérica', frecuencia: 'Vuelos diarios' },
            { id: 2, nombre: 'Avianca', iata: 'AV', descripcion: `Rutas hacia ${capital}.`, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Logo-avianca.svg/320px-Logo-avianca.svg.png', precio_desde: 190, moneda: 'USD', clase: 'Económica', url_reserva: 'https://www.avianca.com', origen_referencia: 'Bogotá / San Salvador', frecuencia: 'Varios vuelos semanales' },
            { id: 3, nombre: 'American Airlines', iata: 'AA', descripcion: `Conexiones desde EE.UU. hacia ${destino}.`, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/American-Airlines-AA-Logo.svg/320px-American-Airlines-AA-Logo.svg.png', precio_desde: 220, moneda: 'USD', clase: 'Económica', url_reserva: 'https://www.aa.com', origen_referencia: 'Miami (MIA)', frecuencia: 'Vuelos frecuentes' }
        ];
    }
    if (!d.hospedajes || d.hospedajes.length === 0) {
        d.hospedajes = [
            { id: 1, nombre: `Apartamento céntrico - ${capital}`, tipo: 'Apartamento entero', descripcion: `Alojamiento moderno en ${capital}.`, imagen: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600', precio_noche: 75, moneda: 'USD', rating: 4.8, reviews: 94, capacidad: '1-4 personas', ubicacion: capital, url: 'https://www.airbnb.com', amenidades: ['WiFi', 'Aire acondicionado', 'Cocina equipada'] },
            { id: 2, nombre: `Hotel boutique - ${destino}`, tipo: 'Habitación privada', descripcion: `Hospedaje con encanto en ${destino}.`, imagen: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600', precio_noche: 95, moneda: 'USD', rating: 4.7, reviews: 67, capacidad: '1-2 personas', ubicacion: capital, url: 'https://www.airbnb.com', amenidades: ['WiFi', 'Desayuno', 'Recepción 24h'] },
            { id: 3, nombre: `Loft urbano - ${capital}`, tipo: 'Loft entero', descripcion: `Espacio amplio en ${capital}.`, imagen: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600', precio_noche: 65, moneda: 'USD', rating: 4.6, reviews: 52, capacidad: '1-3 personas', ubicacion: capital, url: 'https://www.airbnb.com', amenidades: ['WiFi', 'Netflix', 'Cocina'] }
        ];
    }
    if (!d.souvenirs || d.souvenirs.length === 0) {
        d.souvenirs = [
            { id: 1, nombre: `Artesanías de ${destino}`, ubicacion: capital, descripcion: `Souvenirs auténticos de ${destino}.`, horario: 'Lun-Sáb 9:00-18:00', coords: encodeURIComponent(`${capital}, ${destino}`), productos: [
                { nombre: `Recuerdo de ${destino}`, descripcion: 'Artesanía local.', precio: '$15-40 USD', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
                { nombre: 'Textil artesanal', descripcion: 'Tejidos regionales.', precio: '$25-60 USD', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' }
            ]},
            { id: 2, nombre: `Mercado local - ${capital}`, ubicacion: capital, descripcion: `Productos típicos de ${destino}.`, horario: 'Mar-Dom 10:00-17:00', coords: encodeURIComponent(`Mercado ${capital}`), productos: [
                { nombre: 'Especias locales', descripcion: 'Sabores de la región.', precio: '$8-20 USD', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' }
            ]}
        ];
    }
    if (!d.guias || d.guias.length === 0) {
        let g = loadGuidesForCountry(codigo, []);
        if (g.length === 0) {
            g = [
                { id: 9001, name: `Sofía Mendoza`, description: `Guía certificada en ${capital} con experiencia en cultura e historia de ${destino}.`, languages: 'Español, Inglés', location: capital, country: codigo, rank: 'gold', price: 35, photo: 'https://randomuser.me/api/portraits/women/44.jpg', especialidades: ['Cultura', 'Historia', 'Ciudad'], disponible: true },
                { id: 9002, name: `Diego Ramírez`, description: `Especialista en gastronomía y rutas locales de ${destino}.`, languages: 'Español, Inglés', location: capital, country: codigo, rank: 'silver', price: 25, photo: 'https://randomuser.me/api/portraits/men/46.jpg', especialidades: ['Gastronomía', 'Mercados', 'Tours urbanos'], disponible: true }
            ];
        }
        d.guias = g;
    }
    if (!d.secciones) d.secciones = ['cultura', 'lugares', 'gastronomia', 'aventura', 'historia', 'practica'];
    return d;
}

// ============================================================
// 4. RENDERIZADO DE GUÍAS (con traducción) - SIN CAMBIOS
// ============================================================
function renderGuideFilters() {
    const container = document.getElementById('guidesListContainer');
    if (!container) return;
    if (guiasPanama.length === 0) {
        container.innerHTML = `<p style="padding:40px;text-align:center;opacity:.6">${_t('cargandoGuias')}</p>`;
        return;
    }
    const filters = ['all', 'diamond', 'gold', 'silver'];
    const filterLabels = {
        all: _t('filtroTodos'),
        diamond: _t('rankDiamante'),
        gold: _t('rankOro'),
        silver: _t('rankPlata')
    };
    let html = '<div class="filter-bar">';
    filters.forEach(f => {
        html += `<div class="filter-chip ${currentGuideFilter === f ? 'active' : ''}" onclick="setGuideFilter('${f}')">${filterLabels[f]}</div>`;
    });
    html += '</div><div id="guidesList"></div>';
    container.innerHTML = html;
    renderGuidesList();
}

function setGuideFilter(f) { currentGuideFilter = f; renderGuideFilters(); }

function contactarGuia(name, phone, email) {
    let msg = _t('contactGuide') + ': ' + name;
    if (phone) msg += '\n📞 ' + phone;
    if (email) msg += '\n✉️ ' + email;
    alert(msg);
}

function renderGuidesList() {
    let list = guiasPanama.filter(g => currentGuideFilter === 'all' || g.rank === currentGuideFilter);
    const order = { diamond: 0, gold: 1, silver: 2 };
    list.sort((a, b) => (order[a.rank] || 3) - (order[b.rank] || 3));
    const container = document.getElementById('guidesList');
    if (!container) return;
    if (list.length === 0) {
        container.innerHTML = `<p style="padding:40px;text-align:center">${_t('sinGuias')}</p>`;
        return;
    }
    const rankLabels = {
        diamond: _t('rankDiamante'),
        gold: _t('rankOro'),
        silver: _t('rankPlata')
    };
    const availYes = _t('guiaDisponible');
    const availNo = _t('guiaNoDisponible');
    const btnContratar = _t('contratar');
    const precioHora = _t('precioHora');
    container.innerHTML = list.map(g => {
        const gn = _t(g.name);
        const gd = _t(g.description);
        const gl = g.languages ? _t(g.languages) : '';
        const goc = g.location ? _t(g.location) : '';
        return `
        <div class="guide-card rank-${g.rank}">
            <img class="guide-avatar" src="${g.photo}" alt="${gn}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(gn)}&background=0050a0&color=fff'">
            <div class="guide-info">
                <div class="guide-name-row">
                    <span class="guide-name">${gn}</span>
                    <span class="rank-badge badge-${g.rank}">${rankLabels[g.rank] || g.rank}</span>
                    ${g.disponible !== undefined ? `<span class="guide-avail ${g.disponible ? 'avail-yes' : 'avail-no'}">${g.disponible ? availYes : availNo}</span>` : ''}
                </div>
                <p class="guide-desc">${gd}</p>
                <div class="guide-meta">
                    ${g.languages ? `<span>${gl}</span>` : ''}
                    ${g.location ? `<span>${goc}</span>` : ''}
                </div>
                ${g.especialidades ? `<div class="guide-tags">${g.especialidades.map(e => `<span class="guide-tag">${_t(e)}</span>`).join('')}</div>` : ''}
            </div>
            <div class="guide-price-col">
                <div class="price-num">$${g.price}</div>
                <div class="price-unit">${precioHora}</div>
                <button class="btn-sm" onclick="contactarGuia('${gn.replace(/'/g, "\\'")}', '${(g.phone || '').replace(/'/g, "\\'")}', '${(g.email || '').replace(/'/g, "\\'")}')">${btnContratar}</button>
            </div>
        </div>`;
    }).join('');
}

// ============================================================
// 5. RENDERIZADO DE AEROLÍNEAS, HOSPEDAJES, SOUVENIRS (CORREGIDO)
// ============================================================
function renderAerolineas(d) {
    const grid = document.getElementById('airlineGrid');
    if (!grid) return;
    if (!aerolineasData || aerolineasData.length === 0) {
        grid.innerHTML = `<p style="padding:40px;text-align:center;opacity:.6">${_t('aerolineasNoDisponible')}</p>`;
        return;
    }
    grid.innerHTML = aerolineasData.map(a => `
        <div class="airline-card">
            <div class="airline-logo-wrap">
                <img class="airline-logo" src="${a.logo}" alt="${a.nombre}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                <div class="airline-logo-fallback" style="display:none">${a.iata}</div>
            </div>
            <div class="airline-info">
                <div class="airline-name">${a.nombre} <span class="airline-iata">${a.iata}</span></div>
                <p class="airline-desc">${_t(a.descripcion) || a.descripcion}</p>
                <div class="airline-meta">
                    <span class="airline-origin">${_t(a.origen_referencia) || a.origen_referencia}</span>
                    <span class="airline-freq">${_t(a.frecuencia) || a.frecuencia}</span>
                </div>
            </div>
            <div class="airline-price-col">
                <div class="airline-price-label">${_t('desde')}</div>
                <div class="airline-price">$${a.precio_desde}</div>
                <div class="airline-class">${a.clase}</div>
                <a href="${a.url_reserva}" target="_blank" rel="noopener noreferrer" class="btn-airline">${_t('reservarVuelo')}</a>
            </div>
        </div>
    `).join('');
    const headerBg = document.getElementById('aerolineasHeaderBg');
    if (headerBg && d) headerBg.style.backgroundImage = `url('${d.page_header_img}')`;
    
    // ✅ CORRECCIÓN: Usar claves existentes del diccionario
    const titulo = document.getElementById('aerolineasTitulo');
    if (titulo && d) {
        // Usa la clave 'aerolineasTitulo' que SÍ existe en el diccionario
        titulo.textContent = `${_t('aerolineasTitulo')} — ${nombrePais(currentCountryCode, d.nombre)}`;
        // O también podrías usar: titulo.textContent = _t('aerolineasTitulo');
    }
    const desc = document.getElementById('aerolineasDesc');
    if (desc && d) {
        // Usa la clave 'aerolineasDesc' que SÍ existe en el diccionario
        desc.textContent = `${_t('aerolineasDesc')} ${nombrePais(currentCountryCode, d.nombre)}.`;
    }
}

function renderHospedajes(d) {
    const grid = document.getElementById('hospedajesGrid');
    if (!grid) return;
    if (!hospedajesData || hospedajesData.length === 0) {
        grid.innerHTML = `<p style="padding:40px;text-align:center;opacity:.6">${_t('hospedajesNoDisponible')}</p>`;
        return;
    }
    // Nota aclaratoria: mostramos zonas/áreas amplias, no propiedades exactas.
    const zonaNota = `
        <div class="kv-zona-nota" style="grid-column:1/-1;width:100%;margin:2px 0 10px;padding:12px 16px;border-radius:14px;background:rgba(46,110,220,.09);border:1px solid rgba(46,110,220,.28);font-size:.84rem;line-height:1.55;display:flex;gap:10px;align-items:flex-start;">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="flex-shrink:0;margin-top:2px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <span>${_t('hospedajesZonaNota')}</span>
        </div>`;
    grid.innerHTML = zonaNota + hospedajesData.map(h => {
        const stars = Math.round(h.rating);
        const starsHtml = Array.from({length: 5}, (_, i) => `<svg width="12" height="12" viewBox="0 0 24 24" fill="${i < stars ? '#f59e0b' : 'none'}" stroke="#f59e0b" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`).join('');
        return `
            <div class="hospedaje-card">
                <div class="hospedaje-img-wrap">
                    <img class="hospedaje-img" src="${h.imagen}" alt="${_t(h.nombre)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400'">
                    <div class="hospedaje-tipo">${_t(h.tipo) || h.tipo}</div>
                </div>
                <div class="hospedaje-body">
                    <div class="hospedaje-location">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        ${_t('zonaLabel')}: ${_t(h.ubicacion) || h.ubicacion}
                    </div>
                    <h4 class="hospedaje-nombre">${_t(h.nombre)}</h4>
                    <p class="hospedaje-desc">${_t(h.descripcion) || h.descripcion}</p>
                    <div class="hospedaje-rating">
                        <div class="stars-row">${starsHtml}</div>
                        <span class="rating-num">${h.rating}</span>
                        <span class="rating-reviews">(${h.reviews} ${_t('reviewsLabel')})</span>
                    </div>
                    <div class="hospedaje-amenidades">
                        ${h.amenidades ? h.amenidades.slice(0, 3).map(am => `<span class="amenidad-tag">${_t(am) || am}</span>`).join('') : ''}
                    </div>
                </div>
                <div class="hospedaje-footer">
                    <div class="hospedaje-precio-wrap">
                        <div class="hospedaje-precio-label">${_t('porNoche')}</div>
                        <div class="hospedaje-precio">$${h.precio_noche} <span>${h.moneda}</span></div>
                        <div class="hospedaje-cap">${_t(h.capacidad) || h.capacidad}</div>
                    </div>
                    <a href="${h.url}" target="_blank" rel="noopener noreferrer" class="btn-hospedaje">${_t('reservarEstadia')}</a>
                </div>
            </div>
        `;
    }).join('');
    const headerBg = document.getElementById('hospedajesHeaderBg');
    if (headerBg && d) headerBg.style.backgroundImage = `url('${d.page_header_img}')`;
    
    // ✅ CORRECCIÓN: Usar claves existentes del diccionario
    const titulo = document.getElementById('hospedajesTitulo');
    if (titulo && d) {
        titulo.textContent = `${_t('hospedajesTitulo')} — ${nombrePais(currentCountryCode, d.nombre)}`;
    }
    const desc = document.getElementById('hospedajesDesc');
    if (desc && d) {
        desc.textContent = `${_t('hospedajesDesc')} ${nombrePais(currentCountryCode, d.nombre)}.`;
    }
}

function renderSouvenirs(d) {
    const grid = document.getElementById('souvenirsGrid');
    if (!grid) return;
    if (souvenirsTiendas.length === 0) {
        grid.innerHTML = `<p style="padding:40px;text-align:center;opacity:.6">${_t('cargandoTiendas')}</p>`;
        return;
    }

    const totalProductos = souvenirsTiendas.reduce((n, t) => n + (t.productos ? t.productos.length : 0), 0);
    const meta = document.getElementById('souvenirsMeta');
    if (meta) meta.innerHTML = `<strong>${souvenirsTiendas.length}</strong> ${_t('souvenirsTiendasLabel')} · <strong>${totalProductos}</strong> ${_t('souvenirsProductosLabel')}`;

    grid.innerHTML = souvenirsTiendas.map(tienda => {
        const prod = tienda.productos || [];
        const portada = (prod[0] && prod[0].img) || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400';
        let precioDesde = Infinity;
        prod.forEach(p => { const n = parseInt(p.precio); if (!isNaN(n) && n < precioDesde) precioDesde = n; });
        const precioHtml = isFinite(precioDesde)
            ? `<div class="souv-price-tag">${_t('desde')} $${precioDesde}</div>`
            : '';
        const mini = prod.slice(0, 3).map(p => `
            <div class="souv-mini-item" onclick="openSouvenirModal(${tienda.id})" title="${_t('verTodosLosProductos')}">
                <img src="${p.img}" alt="${_t(p.nombre)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100'">
                <span>${_t(p.nombre)}</span>
                ${p.precio ? `<span class="souv-mini-price">${_t(p.precio) || p.precio}</span>` : ''}
            </div>`).join('');

        return `
        <article class="souvenir-card-v2" onclick="openSouvenirModal(${tienda.id})" role="button" tabindex="0" aria-label="${_t(tienda.nombre)}" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openSouvenirModal(${tienda.id})}">
            <div class="souv-img-wrap">
                <img class="souv-main-img" src="${portada}" alt="${_t(tienda.nombre)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'">
                <div class="souv-overlay"></div>
                ${precioHtml}
                <div class="souv-product-count">${prod.length} ${_t('articulos')}</div>
                <div class="souv-location-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    ${_t(tienda.ubicacion) || tienda.ubicacion}
                </div>
            </div>
            <div class="souv-body">
                <h4 class="souv-nombre">${_t(tienda.nombre)}</h4>
                <p class="souv-desc">${_t(tienda.descripcion) || tienda.descripcion}</p>
                ${tienda.horario ? `<div class="souv-horario"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${_t(tienda.horario) || tienda.horario}</div>` : ''}
                <div class="souv-products-preview">${mini}</div>
            </div>
            <div class="souv-footer">
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tienda.coords)}" target="_blank" rel="noopener" class="souv-map-btn" onclick="event.stopPropagation()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    ${_t('verEnMapa')}
                </a>
                <button class="btn-sm" onclick="event.stopPropagation();openSouvenirModal(${tienda.id})">${_t('verTodosLosProductos')}</button>
            </div>
        </article>`;
    }).join('');
    const headerBg = document.getElementById('souvenirsHeaderBg');
    if (headerBg && d) headerBg.style.backgroundImage = `url('${d.page_header_img}')`;
    
    // ✅ CORRECCIÓN: Usar claves existentes del diccionario
    const titulo = document.getElementById('souvenirsTitulo');
    if (titulo && d) {
        titulo.textContent = `${_t('souvenirsTitulo')} — ${nombrePais(currentCountryCode, d.nombre)}`;
    }
    const desc = document.getElementById('souvenirsDesc');
    if (desc && d) {
        desc.textContent = `${_t('souvenirsDesc')} ${nombrePais(currentCountryCode, d.nombre)}.`;
    }
}

function openSouvenirModal(shopId) {
    const tienda = souvenirsTiendas.find(t => t.id === shopId);
    if (!tienda) return;
    const modal = document.getElementById('souvenirModal');
    document.getElementById('modalShopName').innerText = _t(tienda.nombre);
    const loc = document.getElementById('modalShopLocation');
    if (loc) loc.textContent = _t(tienda.ubicacion) || tienda.ubicacion;
    const count = document.getElementById('modalShopCount');
    if (count) count.textContent = `${tienda.productos.length} ${_t('articulos')}`;
    let productsHtml = '<div class="product-grid">';
    tienda.productos.forEach(p => {
        productsHtml += `
            <div class="product-card">
                <div class="product-card-img-wrap">
                    <img class="product-card-img" src="${p.img}" alt="${_t(p.nombre)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300'">
                </div>
                <div class="product-card-body">
                    <strong class="product-card-name">${_t(p.nombre)}</strong>
                    <span class="product-card-desc">${_t(p.descripcion) || p.descripcion}</span>
                    ${p.precio ? `<span class="product-price-chip">${_t(p.precio) || p.precio}</span>` : ''}
                </div>
            </div>`;
    });
    productsHtml += '</div>';
    document.getElementById('modalProducts').innerHTML = productsHtml;
    document.getElementById('modalMapLink').href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tienda.coords)}`;
    modal.classList.add('active');
    if (window.KavariScrollLock) window.KavariScrollLock.lock();
    const closeBtn = document.getElementById('souvenirModalClose');
    if (closeBtn) closeBtn.focus();
}
function closeSouvenirModal() {
    document.getElementById('souvenirModal').classList.remove('active');
    if (window.KavariScrollLock) window.KavariScrollLock.unlock();
}
(function initSouvenirModal() {
    const modal = document.getElementById('souvenirModal');
    if (!modal) return;
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeSouvenirModal();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeSouvenirModal();
    });
})();

// ============================================================
// 6. COUNTRY SELECTOR CUSTOM (sin cambios)
// ============================================================
function getCountryKeys(data) {
    return Object.keys(data || {}).filter(k => {
        const d = data[k];
        return d && typeof d === 'object' && typeof d.nombre === 'string';
    });
}

function initCountrySelector() {
    const trigger = document.getElementById('countryTrigger');
    const panel = document.getElementById('countryPanel');
    const list = document.getElementById('countryOptionsList');
    const search = document.getElementById('countrySearch');
    const select = document.getElementById('paisSelector');
    const triggerName = document.getElementById('countryTriggerName');
    const triggerFlag = document.getElementById('countryTriggerFlag');

    if (!trigger || !panel || !list || !select) return;

    if (datosGlobales && !countryOptionsInitialized) {
        const paises = getCountryKeys(datosGlobales).sort();
        select.innerHTML = paises.map(key => {
            const nombre = nombrePais(key, datosGlobales[key]?.nombre) || key;
            const flag = getCountryFlag(key);
            return `<option value="${key}" ${key === currentCountryCode ? 'selected' : ''}>${flag} ${nombre}</option>`;
        }).join('');
        countryOptionsInitialized = true;
    }

    function renderOptions(filter = '') {
        const paises = getCountryKeys(datosGlobales).sort();
        const filtered = paises.filter(key => {
            const nombre = nombrePais(key, datosGlobales[key]?.nombre) || key;
            return nombre.toLowerCase().includes(filter.toLowerCase());
        });
        list.innerHTML = filtered.map(key => {
            const nombre = nombrePais(key, datosGlobales[key]?.nombre) || key;
            const flag = getCountryFlag(key);
            const isSelected = key === currentCountryCode;
            return `<div class="country-option ${isSelected ? 'selected' : ''}" data-value="${key}" data-name="${nombre}">
                <span class="country-flag">${flag}</span>
                <span class="country-name">${nombre}</span>
                ${isSelected ? '<span class="country-check">✓</span>' : ''}
            </div>`;
        }).join('');

        list.querySelectorAll('.country-option').forEach(el => {
            el.addEventListener('click', function() {
                const value = this.dataset.value;
                select.value = value;
                cambiarPais(value);
                closeCountryPanel();
            });
        });
    }

    function getCountryFlag(key) {
        const flags = {
            'panama': '🇵🇦', 'costa-rica': '🇨🇷', 'colombia': '🇨🇴', 'mexico': '🇲🇽',
            'peru': '🇵🇪', 'republica-dominicana': '🇩🇴', 'argentina': '🇦🇷', 'brasil': '🇧🇷',
            'chile': '🇨🇱', 'ecuador': '🇪🇨', 'cuba': '🇨🇺', 'guatemala': '🇬🇹',
            'bolivia': '🇧🇴', 'venezuela': '🇻🇪', 'uruguay': '🇺🇾', 'paraguay': '🇵🇾',
            'honduras': '🇭🇳', 'nicaragua': '🇳🇮', 'el-salvador': '🇸🇻', 'belice': '🇧🇿',
            'guyana': '🇬🇾', 'trinidad-y-tobago': '🇹🇹', 'jamaica': '🇯🇲', 'puerto-rico': '🇵🇷',
            'bahamas': '🇧🇸', 'haiti': '🇭🇹', 'espana': '🇪🇸', 'portugal': '🇵🇹',
            'italia': '🇮🇹', 'francia': '🇫🇷', 'japon': '🇯🇵', 'tailandia': '🇹🇭',
            'marruecos': '🇲🇦', 'turquia': '🇹🇷', 'grecia': '🇬🇷', 'sudafrica': '🇿🇦'
        };
        return flags[key] || '🌍';
    }

    function updateTrigger() {
        if (datosGlobales && datosGlobales[currentCountryCode]) {
            const nombre = nombrePais(currentCountryCode, datosGlobales[currentCountryCode]?.nombre) || currentCountryCode;
            const flag = getCountryFlag(currentCountryCode);
            triggerName.textContent = nombre;
            triggerFlag.textContent = flag;
        }
        Array.from(select.options).forEach(opt => {
            opt.selected = opt.value === currentCountryCode;
        });
        if (list) {
            list.querySelectorAll('.country-option').forEach(el => {
                const isSelected = el.dataset.value === currentCountryCode;
                el.classList.toggle('selected', isSelected);
                const check = el.querySelector('.country-check');
                if (check) check.style.display = isSelected ? 'inline' : 'none';
            });
        }
    }

    function openCountryPanel() {
        panel.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        renderOptions(search.value);
        setTimeout(() => search.focus(), 100);
    }

    function closeCountryPanel() {
        panel.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
    }

    function toggleCountryPanel() {
        if (panel.classList.contains('open')) {
            closeCountryPanel();
        } else {
            openCountryPanel();
        }
    }

    trigger.addEventListener('click', toggleCountryPanel);

    document.addEventListener('click', function(e) {
        if (!trigger.contains(e.target) && !panel.contains(e.target)) {
            closeCountryPanel();
        }
    });

    search.addEventListener('input', function() {
        renderOptions(this.value);
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && panel.classList.contains('open')) {
            closeCountryPanel();
        }
    });

    window.__updateCountrySelector = updateTrigger;
    window.__renderCountryOptions = renderOptions;

    setTimeout(() => {
        if (datosGlobales) {
            renderOptions();
            updateTrigger();
        }
    }, 100);

    return { updateTrigger, renderOptions, openCountryPanel, closeCountryPanel };
}

// ============================================================
// 7. CARGA Y RENDERIZADO PRINCIPAL
// ============================================================
const DATA_CACHE_KEY = 'kavari-data-cache-v1';

function getDataCache() {
    try {
        const raw = sessionStorage.getItem(DATA_CACHE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
}

function setDataCache(data) {
    try { sessionStorage.setItem(DATA_CACHE_KEY, JSON.stringify(data)); } catch (e) { /* almacenamiento lleno */ }
}

async function loadDataJson() {
    if (datosGlobales) return datosGlobales;
    const cache = getDataCache();
    try {
        // Siempre pide la copia fresca ('no-cache' evita que el navegador
        // devuelva una versión vieja): los cambios en data.json se reflejan
        // al recargar sin tener que cerrar la pestaña.
        const respuesta = await fetch('data/data.json', { cache: 'no-cache' });
        if (!respuesta.ok) throw new Error(`HTTP error! status: ${respuesta.status}`);
        const data = await respuesta.json();
        datosGlobales = data;
        setDataCache(data);
        return data;
    } catch (e) {
        // Sin servidor/red: usa la copia guardada de esta sesión si existe
        if (cache) {
            console.warn('[KAVARI] Usando data.json en caché (no se pudo recargar):', e);
            datosGlobales = cache;
            return cache;
        }
        throw e;
    }
}

// Precarga de data.json en cuanto se evalúa el script (antes de DOMContentLoaded),
// para que al entrar a la página ya esté disponible y no haya recarga visible.
loadDataJson().catch(() => { /* se reintentará en cargarPais */ });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ============================================================
// 7b. TRANSICIÓN PREMIUM DE PAÍS (veil con mascota)
// Oculta el "flash" de recarga: muestra un velo breve con el
// nombre del país mientras se renderiza el contenido y luego
// se desvanece suavemente.
// ============================================================
let _cambiandoPais = false;

function getCountryVeil() {
    let v = document.getElementById('kavariCountryVeil');
    if (!v) {
        v = document.createElement('div');
        v.id = 'kavariCountryVeil';
        v.className = 'kavari-country-veil';
        v.innerHTML = `
            <div class="kcv-inner">
                <div class="kcv-mascot"><img src="img/mascota.png" alt="" onerror="this.style.display='none'"></div>
                <div class="kcv-name" id="kcvName"></div>
                <div class="kcv-bar"><div class="kcv-bar-fill"></div></div>
            </div>`;
        document.body.appendChild(v);
    }
    return v;
}

async function withCountryVeil(codigo, { minMs = 180 } = {}) {
    if (_cambiandoPais) return;
    _cambiandoPais = true;
    const veil = getCountryVeil();
    const nombreEl = veil.querySelector('#kcvName');
    if (nombreEl) nombreEl.textContent = nombrePais(codigo, datosGlobales?.[codigo]?.nombre) || codigo;
    veil.classList.add('kcv-show');
    const inicio = Date.now();
    try {
        await cargarPais(codigo);
        const restante = minMs - (Date.now() - inicio);
        if (restante > 0) await sleep(restante);
    } finally {
        veil.classList.remove('kcv-show');
        _cambiandoPais = false;
    }
}

async function cargarPais(codigoPais) {
    try {
        console.log('🔄 Cargando país:', codigoPais);
        const data = await loadDataJson();
        if (!window.__countrySelectorReady) {
            initCountrySelector();
            window.__countrySelectorReady = true;
        }
        const d = data[codigoPais];
        if (!d) {
            console.error('❌ País no encontrado:', codigoPais);
            return;
        }
        console.log('✅ País encontrado:', d.nombre);
        const enriched = enrichCountryData(codigoPais, JSON.parse(JSON.stringify(d)));
        countryData = enriched;
        currentCountryCode = codigoPais;
        document.title = nombrePais(codigoPais, d.nombre) + ' · KAVARI';

        guiasPanama = loadGuidesForCountry(codigoPais, enriched.guias);
        // Supabase en segundo plano: el render inicial NO espera la red.
        // Cuando lleguen las guías remotas se fusionan y se refresca la sección.
        const codSolicitado = codigoPais;
        loadApprovedGuidesFromSupabase(codSolicitado).then(supabaseGuides => {
            if (codSolicitado !== currentCountryCode) return; // ya se cambió de país
            if (supabaseGuides.length > 0) {
                guiasPanama = guiasPanama.filter(g => !isDemoGuide(g));
                guiasPanama = mergeGuideSources(guiasPanama, supabaseGuides);
                renderGuideFilters();
            }
        }).catch(() => { /* silencioso */ });
        souvenirsTiendas = enriched.souvenirs || [];
        aerolineasData = enriched.aerolineas || [];
        hospedajesData = enriched.hospedajes || [];

        renderAllSections(enriched);
        renderGuideFilters();
        renderSouvenirs(enriched);
        renderAerolineas(enriched);
        renderHospedajes(enriched);

        if (window.__updateCountrySelector) {
            window.__updateCountrySelector();
        }

        llenarSelectorPaises(datosGlobales);
        if (window.__renderCountryOptions) window.__renderCountryOptions('');
        if (window.KavariChatbot) window.KavariChatbot.setContext({ country: Object.assign({}, enriched, { code: codigoPais }), guias: guiasPanama, aerolineas: aerolineasData, hospedajes: hospedajesData });
        window.__kavariDestinoInit = true;
        requestAnimationFrame(() => observeReveals());
    } catch (error) {
        console.error('❌ Error al cargar data.json:', error);
        alert('No se pudo cargar la información del destino. Revisa la consola para más detalles.');
    }
}

function llenarSelectorPaises(todos) {
    const select = document.getElementById('paisSelector');
    if (!select) return;
}

function cambiarPais(codigo) {
    if (!codigo || codigo === currentCountryCode) return;
    localStorage.setItem('paisSeleccionado', codigo);
    withCountryVeil(codigo);
    window.dispatchEvent(new CustomEvent('kavari:countrychange', { detail: { country: codigo } }));
}

// ============================================================
// 8. RENDER ALL SECTIONS
// ============================================================
function renderAllSections(d) {
    if (!d) return;

    // Hero
    const heroBg = document.getElementById('heroBg');
    if (heroBg) heroBg.style.backgroundImage = `url('${d.hero_img}')`;
    const heroContinente = document.getElementById('heroContinente');
    if (heroContinente) heroContinente.textContent = _t(d.continente) || 'América';
    const heroTitulo = document.getElementById('heroTitulo');
    if (heroTitulo) heroTitulo.innerHTML = nombrePais(currentCountryCode, d.nombre) + '<span id="heroSubtitulo">' + (_t(d.subtitulo) || '') + '</span>';
    const heroDesc = document.getElementById('heroDesc');
    if (heroDesc) heroDesc.textContent = _t(d.descripcion) || '';

    // Ticker
    const tickerInner = document.getElementById('tickerInner');
    if (tickerInner && d.ticker) {
        const items = [...d.ticker, ...d.ticker];
        tickerInner.innerHTML = items.map(item => {
            const [name, desc] = item.split(' | ');
            return `<span class="tick-item">${_t(name) || name} <span class="tick-dot"></span> <b>${_t(desc) || desc || ''}</b></span>`;
        }).join('');
    }

    // Stats Bar
    const statsBar = document.getElementById('statsBar');
    if (statsBar && d.stats) {
        statsBar.innerHTML = d.stats.map(s =>
            `<div class="stat-cell"><div class="stat-n">${s.numero}</div><div class="stat-l">${_t(s.label) || s.label}</div></div>`
        ).join('');
    }

    // Destinos inicio
    const destinosTitulo = document.getElementById('destinosTitulo');
    if (destinosTitulo) destinosTitulo.textContent = `${_t('destinosDestacadosEn')} ${nombrePais(currentCountryCode, d.nombre)}`;
    const destinosInicio = document.getElementById('destinosInicio');
    if (destinosInicio && d.destinos) {
        destinosInicio.innerHTML = d.destinos.slice(0, 4).map((dest, i) => `
            <div class="card reveal d${(i % 4) + 1}">
                <div class="card-img-wrap"><img class="card-img" src="${dest.imagen}" alt="${_t(dest.nombre)}" decoding="async" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1578922746465-3a80a228f223?q=80&w=800'"></div>
                <div class="card-body">
                    <div class="card-tag">${_t(dest.tag) || dest.tag}</div>
                    <h4>${_t(dest.nombre)}</h4>
                    <p>${_t(dest.descripcion).substring(0, 120)}...</p>
                    <button class="btn-card" onclick="openModal('${dest.id}')"><span>${_t('verMas')}</span></button>
                </div>
            </div>
        `).join('');
    }

    // Feature Band
    const featureBand = document.getElementById('featureBand');
    if (featureBand && d.destinos && d.destinos.length > 0) {
        const featDest = d.destinos[3] || d.destinos[0];
        featureBand.innerHTML = `
            <div class="feature-img"><img src="${featDest.imagen}" alt="${_t(featDest.nombre)}" decoding="async" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200'"></div>
            <div class="feature-text">
                <div class="sec-tag-line">${_t(d.continente) || ''} · ${_t(featDest.tag) || featDest.tag}</div>
                <h3>${_t(featDest.nombre)}</h3>
                <p>${_t(featDest.descripcion)}</p>
                <div class="data-chip">${_t(featDest.tag) || featDest.tag}</div>
                <button class="btn-card" style="margin-top:22px" onclick="openModal('${featDest.id}')"><span>${_t('explorarMas')}</span></button>
            </div>`;
    }

    // Quick Facts
    const quickFacts = document.getElementById('quickFacts');
    if (quickFacts && d.quick_facts) {
        quickFacts.innerHTML = `
            <h4>${_t('datosSobre')} ${nombrePais(currentCountryCode, d.nombre)}</h4>
            <div class="facts-grid">
                ${d.quick_facts.map(f => `
                    <div class="fact-item">
                        <div class="fact-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/></svg></div>
                        <div class="fact-text"><h5>${_t(f.titulo) || f.titulo}</h5><p>${_t(f.texto) || f.texto}</p></div>
                    </div>
                `).join('')}
            </div>`;
    }

    // Cultura
    if (d.cultura) {
        const c = d.cultura;
        const headerBg = document.getElementById('culturaHeaderBg');
        if (headerBg) headerBg.style.backgroundImage = `url('${c.header_img || d.page_header_img}')`;
        const culturaTag = document.querySelector('#section-cultura .ph-tag');
        if (culturaTag) culturaTag.textContent = _t('culturaTag');
        const culturaTitulo = document.getElementById('culturaTitulo');
        if (culturaTitulo) culturaTitulo.textContent = _t(c.titulo) || _t('culturaTitulo');
        const culturaDesc = document.getElementById('culturaDesc');
        if (culturaDesc) culturaDesc.textContent = _t(c.descripcion) || _t('culturaDesc');
        const culturaStats = document.getElementById('culturaStats');
        if (culturaStats && c.stats) {
            culturaStats.innerHTML = c.stats.map(s =>
                `<div class="stat-cell"><div class="stat-n">${s.numero}</div><div class="stat-l">${_t(s.label) || s.label}</div></div>`
            ).join('');
        }
        const culturaItems = document.getElementById('culturaItems');
        if (culturaItems && c.items) {
            culturaItems.innerHTML = c.items.map((item, i) => `
                <div class="card reveal d${(i % 4) + 1}">
                    <div class="card-img-wrap"><img class="card-img" src="${item.imagen}" alt="${_t(item.nombre)}" decoding="async" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1521295121783-8a321d551ad2?q=80&w=800'"></div>
                    <div class="card-body">
                        <div class="card-tag">${_t(item.tag) || item.tag}</div>
                        <h4>${_t(item.nombre)}</h4>
                        <p>${_t(item.descripcion).substring(0, 120)}...</p>
                        <button class="btn-card" onclick="openModal('${item.id}')"><span>${_t('verMas')}</span></button>
                    </div>
                </div>
            `).join('');
        }
        if (c.dark_band) {
            const darkBand = document.getElementById('culturaDarkBand');
            if (darkBand) {
                darkBand.innerHTML = `
                    <div class="dark-band-inner">
                        <div class="sec-tag-line">${_t('culturaDarkBandTag')}</div>
                        <h2>${_t(c.dark_band.titulo) || c.dark_band.titulo}</h2>
                        <p>${_t(c.dark_band.texto) || c.dark_band.texto}</p>
                        <div class="dark-data">${c.dark_band.datos.map(dd =>
                            `<div class="dd-item"><div class="dd-n">${dd.numero}</div><div class="dd-l">${_t(dd.label) || dd.label}</div></div>`
                        ).join('')}</div>
                    </div>`;
            }
        }
    }

    // Lugares
    const lugaresTag = document.querySelector('#section-lugares .ph-tag');
    if (lugaresTag) lugaresTag.textContent = _t('lugaresTag');
    const lugaresHeaderBg = document.getElementById('lugaresHeaderBg');
    if (lugaresHeaderBg) lugaresHeaderBg.style.backgroundImage = `url('${d.page_header_img}')`;
    const lugaresTitulo = document.getElementById('lugaresTitulo');
    if (lugaresTitulo) lugaresTitulo.textContent = `${_t('destinosImprescindiblesEn')} ${nombrePais(currentCountryCode, d.nombre)}`;
    const lugaresSubTitulo = document.getElementById('lugaresSubTitulo');
    if (lugaresSubTitulo) lugaresSubTitulo.textContent = _t('losDestinosQueDefinen');
    const todosDestinos = document.getElementById('todosDestinos');
    if (todosDestinos && d.destinos) {
        todosDestinos.innerHTML = d.destinos.map((dest, i) => `
            <div class="card reveal d${(i % 4) + 1}">
                <div class="card-img-wrap"><img class="card-img" src="${dest.imagen}" alt="${_t(dest.nombre)}" decoding="async" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800'"></div>
                <div class="card-body">
                    <div class="card-tag">${_t(dest.tag) || dest.tag}</div>
                    <h4>${_t(dest.nombre)}</h4>
                    <p>${_t(dest.descripcion).substring(0, 120)}...</p>
                    <button class="btn-card" onclick="openModal('${dest.id}')"><span>${_t('verMas')}</span></button>
                </div>
            </div>
        `).join('');
    }

    // Gastronomía
    if (d.gastronomia) {
        const g = d.gastronomia;
        const gastronomiaTag = document.querySelector('#section-gastronomia .ph-tag');
        if (gastronomiaTag) gastronomiaTag.textContent = _t('gastronomiaTag');
        const gastronomiaHeaderBg = document.getElementById('gastronomiaHeaderBg');
        if (gastronomiaHeaderBg) gastronomiaHeaderBg.style.backgroundImage = `url('${g.header_img || d.page_header_img}')`;
        const gastronomiaTitulo = document.getElementById('gastronomiaTitulo');
        if (gastronomiaTitulo) gastronomiaTitulo.textContent = _t(g.titulo) || _t('gastronomiaTitulo');
        const gastronomiaDesc = document.getElementById('gastronomiaDesc');
        if (gastronomiaDesc) gastronomiaDesc.textContent = _t(g.descripcion) || _t('gastronomiaDesc');
        const foodGrid = document.getElementById('foodGrid');
        if (foodGrid && g.platos) {
            foodGrid.innerHTML = g.platos.map(plato => `
                <div class="food-item">
                    <div class="food-thumb"><img src="${plato.imagen}" alt="${_t(plato.nombre)}" decoding="async" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=400'"></div>
                    <div class="food-body">
                        <div class="food-cat">${_t(plato.categoria) || plato.categoria}</div>
                        <h4>${_t(plato.nombre)}</h4>
                        <p>${_t(plato.descripcion) || plato.descripcion}</p>
                        ${plato.nota ? `<div class="food-note">${_t(plato.nota) || plato.nota}</div>` : ''}
                    </div>
                </div>
            `).join('');
        }
    }

    // Aventura
    if (d.aventura) {
        const a = d.aventura;
        const headerBg = document.getElementById('aventuraHeaderBg');
        if (headerBg) headerBg.style.backgroundImage = `url('${a.header_img || d.page_header_img}')`;
        const aventuraTitulo = document.getElementById('aventuraTitulo');
        if (aventuraTitulo) aventuraTitulo.textContent = _t(a.titulo) || _t('aventuraTitulo');
        const aventuraDesc = document.getElementById('aventuraDesc');
        if (aventuraDesc) aventuraDesc.textContent = _t(a.descripcion) || _t('aventuraDesc');
        const aventuraStats = document.getElementById('aventuraStats');
        if (aventuraStats && a.stats) {
            aventuraStats.innerHTML = a.stats.map(s =>
                `<div class="stat-cell"><div class="stat-n">${s.numero}</div><div class="stat-l">${_t(s.label) || s.label}</div></div>`
            ).join('');
        }
        const actList = document.getElementById('actList');
        if (actList && a.actividades) {
            actList.innerHTML = a.actividades.map(act => `
                <div class="act-item">
                    <div class="act-n">${act.numero}</div>
                    <div class="act-content"><h4>${_t(act.nombre)}</h4><p>${_t(act.descripcion)}</p></div>
                    <div class="act-badges">${act.badges.map(b => `<span class="act-badge">${_t(b) || b}</span>`).join('')}</div>
                </div>
            `).join('');
        }
        if (a.dark_band) {
            const darkBand = document.getElementById('aventuraDarkBand');
            if (darkBand) {
                darkBand.innerHTML = `
                    <div class="dark-band-inner">
                        <div class="sec-tag-line">${_t('aventuraDarkBandTag')}</div>
                        <h2>${_t(a.dark_band.titulo) || a.dark_band.titulo}</h2>
                        <p>${_t(a.dark_band.texto) || a.dark_band.texto}</p>
                        <div class="dark-data">${a.dark_band.datos.map(dd =>
                            `<div class="dd-item"><div class="dd-n">${dd.numero}</div><div class="dd-l">${_t(dd.label) || dd.label}</div></div>`
                        ).join('')}</div>
                    </div>`;
            }
        }
    }

    // Info práctica
    if (d.practica) {
        const p = d.practica;
        const practicaTag = document.querySelector('#section-practica .ph-tag');
        if (practicaTag) practicaTag.textContent = _t('practicaTag');
        const practicaHeaderBg = document.getElementById('practicaHeaderBg');
        if (practicaHeaderBg) practicaHeaderBg.style.backgroundImage = `url('${p.header_img || d.page_header_img}')`;
        const practicaTitulo = document.getElementById('practicaTitulo');
        if (practicaTitulo) practicaTitulo.textContent = _t(p.titulo) || _t('practicaTitulo');
        const practicaDesc = document.getElementById('practicaDesc');
        if (practicaDesc) practicaDesc.textContent = _t(p.descripcion) || _t('practicaDesc');
        const infoGrid = document.getElementById('infoGrid');
        if (infoGrid && p.info_cards) {
            infoGrid.innerHTML = p.info_cards.map(card => `
                <div class="info-card">
                    <div class="info-icon"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" stroke-width="1.8"><circle cx="12" cy="12" r="10"/></svg></div>
                    <h4>${_t(card.titulo) || card.titulo}</h4>
                    <p>${_t(card.texto) || card.texto}</p>
                    <div class="info-badge">${_t(card.badge) || card.badge}</div>
                </div>
            `).join('');
        }
        const practicaTwoCol = document.getElementById('practicaTwoCol');
        if (practicaTwoCol && p.temporadas && p.itinerario) {
            practicaTwoCol.innerHTML = `
                <div class="col-block">
                    <h4>${_t('cuandoViajar')}</h4>
                    ${p.temporadas.map(temp => `<p><strong>${_t(temp.nombre) || temp.nombre}: ${temp.meses}</strong> · ${_t(temp.descripcion) || temp.descripcion}</p>`).join('')}
                </div>
                <div class="col-block">
                    <h4>${_t('itinerarioSugerido')}</h4>
                    <ul class="numbered-list">
                        ${p.itinerario.map(item => `<li><span class="nl-num">${item.dia}</span>${_t(item.titulo) || item.titulo}: ${_t(item.texto) || item.texto}</li>`).join('')}
                    </ul>
                </div>`;
        }
    }

    // Guías título
    const guiasTitle = document.getElementById('guiasSectionTitle');
    if (guiasTitle) guiasTitle.textContent = `${_t('guiasSectionTitle')} — ${nombrePais(currentCountryCode, d.nombre)}`;
}

// ============================================================
// 9. MODAL DE DESTINOS (sin cambios)
// ============================================================
function openModal(id) {
    let item = countryData.destinos?.find(d => d.id === id) || countryData.cultura?.items?.find(i => i.id === id);
    if (!item) return;
    document.getElementById('modalBody').innerHTML = `
        <img src="${item.imagen}" alt="${_t(item.nombre)}" decoding="async" style="width:100%;border-radius:12px;margin-bottom:20px;max-height:400px;object-fit:cover" onerror="this.style.display='none'">
        <div class="card-tag">${_t(item.tag) || item.tag}</div>
        <h3 style="font-family:'Nunito',sans-serif;font-size:24px;color:var(--text-primary);margin:12px 0">${_t(item.nombre)}</h3>
        <p style="line-height:1.8;color:var(--text-secondary)">${_t(item.detalle) || _t(item.descripcion) || item.descripcion}</p>
        ${item.precio_entrada ? `<div class="info-badge" style="margin-top:12px">${_t('entradaLabel')} ${_t(item.precio_entrada) || item.precio_entrada}</div>` : ''}
        ${item.horario ? `<div class="info-badge" style="margin-top:8px">${_t('horarioLabel')} ${_t(item.horario) || item.horario}</div>` : ''}
        ${item.consejo ? `<p style="margin-top:16px;font-style:italic;color:var(--text-secondary);border-left:3px solid var(--primary);padding-left:12px">${_t('consejoLabel')} ${_t(item.consejo) || item.consejo}</p>` : ''}
    `;
    document.getElementById('modalOverlay').classList.add('active');
    if (window.KavariScrollLock) window.KavariScrollLock.lock();
}
function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    if (window.KavariScrollLock) window.KavariScrollLock.unlock();
}
document.getElementById('modalOverlay')?.addEventListener('click', function(e) { if (e.target === this) closeModal(); });

// ============================================================
// 10. NAVEGACIÓN POR SECCIONES (sin cambios)
// ============================================================
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active', 'fly-in'));
    const target = document.getElementById('section-' + id);
    if (target) {
        target.classList.add('active');
        requestAnimationFrame(() => requestAnimationFrame(() => target.classList.add('fly-in')));
    }
    document.querySelectorAll('.nav-links a[data-sec]').forEach(a => a.classList.toggle('active', a.dataset.sec === id));
    if (id === 'guias') renderGuideFilters();
    if (id === 'souvenires') renderSouvenirs(countryData);
    if (id === 'aerolineas') renderAerolineas(countryData);
    if (id === 'hospedajes') renderHospedajes(countryData);
    setTimeout(() => observeReveals(), 100);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.dataset.sec) {
        a.addEventListener('click', e => {
            e.preventDefault();
            showSection(a.dataset.sec);
        });
    }
});

function toggleMobileDrawer(forceClose) {
    const overlay = document.getElementById('mobileDrawerOverlay');
    const drawer = document.getElementById('mobileDrawer');
    const hamburger = document.getElementById('navHamburger');
    if (!overlay || !drawer) return;

    // El CSS del drawer reacciona a '.active' (y aceptamos '.open' por
    // compatibilidad). Cerrar de forma explícita con true; en cualquier
    // otro caso alterna según el estado actual.
    function setDrawer(abrir) {
        overlay.classList.toggle('active', abrir);
        overlay.classList.toggle('open', abrir);
        drawer.classList.toggle('active', abrir);
        drawer.classList.toggle('open', abrir);
        if (hamburger) {
            hamburger.classList.toggle('active', abrir);
            hamburger.setAttribute('aria-expanded', abrir ? 'true' : 'false');
        }
        if (window.KavariScrollLock) {
            if (abrir) window.KavariScrollLock.lock();
            else window.KavariScrollLock.unlock();
        } else {
            document.body.style.overflow = abrir ? 'hidden' : '';
        }
    }

    if (forceClose === true) {
        setDrawer(false);
        return;
    }

    setDrawer(!overlay.classList.contains('active'));
}

window.addEventListener('scroll', () => {
    document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 24);
}, { passive: true });

// ============================================================
// 11. SCROLL REVEAL (sin cambios)
// ============================================================
function observeReveals() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
}

// ============================================================
// 12. INICIALIZACIÓN Y CAMBIO DE IDIOMA
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    const paisGuardado = localStorage.getItem('paisSeleccionado') || 'panama';
    withCountryVeil(paisGuardado);
});

window.addEventListener('kavari:langchange', () => {
    if (currentCountryCode && window.__kavariDestinoInit) {
        cargarPais(currentCountryCode);
    }
});

// ============================================================
// 13. BOTÓN FLOTANTE "VOLVER AL INICIO"
// Aparece solo si el usuario llegó a este país desde el index
// (paquete o Top 10). Lo devuelve al inicio con una sola pulsación.
// ============================================================
(function initBackToHome() {
    const FLAG = 'kavari-from-index';

    function lang() { return localStorage.getItem('kavari-idioma') || 'es'; }
    function label() {
        return lang() === 'en' ? 'Back to home'
            : lang() === 'pt' ? 'Voltar ao início'
            : 'Volver al inicio';
    }

    const css = ''
        + '#kvBackToHome{position:fixed;left:24px;bottom:160px;z-index:9500;'
        + 'display:inline-flex;align-items:center;gap:10px;border:none;cursor:pointer;'
        + 'padding:13px 22px;border-radius:999px;font-family:Poppins,system-ui,sans-serif;'
        + 'font-size:.9rem;font-weight:600;color:#fff;'
        + 'background:linear-gradient(135deg,#0d1f3c 0%,#2e6edc 100%);'
        + 'box-shadow:0 10px 28px rgba(13,31,60,.35);'
        + 'opacity:0;transform:translateY(16px);pointer-events:none;'
        + 'transition:opacity .35s ease,transform .35s ease,box-shadow .25s ease;}'
        + '#kvBackToHome.show{opacity:1;transform:none;pointer-events:auto;}'
        + '#kvBackToHome:hover{transform:translateY(-3px);box-shadow:0 14px 34px rgba(46,110,220,.45);}'
        + '#kvBackToHome svg{flex-shrink:0;}'
        + '@media (max-width:519px){#kvBackToHome{left:12px;bottom:102px;padding:11px 18px;font-size:.82rem;}}';

    document.addEventListener('DOMContentLoaded', function () {
        try {
            if (sessionStorage.getItem(FLAG) !== '1') return;
            sessionStorage.removeItem(FLAG);

            const style = document.createElement('style');
            style.textContent = css;
            document.head.appendChild(style);

            const btn = document.createElement('button');
            btn.id = 'kvBackToHome';
            btn.type = 'button';
            btn.setAttribute('aria-label', label());
            btn.innerHTML =
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'
                + '<path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>'
                + '<span>' + label() + '</span>';

            btn.addEventListener('click', function () {
                if (window.kavariNavigate) window.kavariNavigate('index.html');
                else window.location.href = 'index.html';
            });

            // Si cambia el idioma, actualiza el texto del botón
            window.addEventListener('kavari:langchange', function () {
                const span = btn.querySelector('span');
                if (span) span.textContent = label();
                btn.setAttribute('aria-label', label());
            });

            document.body.appendChild(btn);
            requestAnimationFrame(function () {
                setTimeout(function () { btn.classList.add('show'); }, 350);
            });
        } catch (e) { /* sessionStorage no disponible: no mostramos el botón */ }
    });
})();

console.log('✅ destino.js cargado correctamente (con soporte para selector custom y drawer móvil)');