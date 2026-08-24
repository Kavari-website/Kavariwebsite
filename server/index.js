/* ══════════════════════════════════════════════════════════════════
   KAVARI Chat API · v4 — Asistente universal con búsqueda web
   ----------------------------------------------------------------
   - Base de conocimiento: indexa todo data/data.json (37 países +
     top 10 + paquetes) en fragmentos ("chunks") con palabras clave.
   - Recuperación (RAG): por cada pregunta puntúa los fragmentos por
     coincidencia de términos y frases; usa el país activo como refuerzo.
   - ROUTER INTELIGENTE: decide por cada mensaje si basta el contexto
     local o conviene BUSCAR EN LA WEB (Google Search Grounding nativo
     de Gemini, sin dependencias extra):
       · Preguntas sobre la plataforma KAVARI → conocimiento oficial.
       · Preguntas de destino con cobertura local → contexto RAG.
       · Datos frescos/externos (visas, eventos, clima, precios
         actuales, noticias...) → Gemini con herramienta google_search.
       · Cualquier otra pregunta → se responde con lógica y se conecta
         de vuelta al turismo y a KAVARI.
   - Respuesta: Gemini con instrucciones de sistema, historial de
     conversación (memoria), contexto recuperado y fuentes web citadas.
   - Fallback: si no hay clave Gemini o la API falla, responde con un
     motor local que sintetiza la respuesta desde los fragmentos.
   - La clave NUNCA vive en la carpeta pública: se lee de
     process.env.GEMINI_API_KEY o del archivo server/.env.
   ══════════════════════════════════════════════════════════════════ */
'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { getPlatformKnowledge } = require('./kavari-knowledge');

const app = express();
const PORT = process.env.PORT || 3007;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

/* ───────────── utilidades ───────────── */
const clean = value => String(value || '').replace(/[<>]/g, '');
const normalize = str => String(str || '')
  .toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^\w\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const tokens = s => new Set(normalize(s).split(' ').filter(Boolean));
const truncate = (s, n) => (s.length > n ? s.slice(0, n).trim() + '…' : s);

/* ───────────── datos del sitio ───────────── */
let data = {};
try {
  data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'data.json'), 'utf8').replace(/^\uFEFF/, ''));
} catch (e) {
  console.error('No se pudo cargar data.json:', e.message);
}

/* ───────────── diccionario ES (idioma.js) para resolver claves ─────────────
   data.json guarda los textos como claves de traducción
   (p. ej. "paisColombia_nombre"). Aquí se cargan los textos reales en
   español para indexarlos en la base de conocimiento y servirlos en las API.
   No modifica data.json: solo resuelve las claves en memoria. ───────────── */
let TRAD = {};
try {
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'idioma.js'), 'utf8');
  const start = src.indexOf('const diccionario = {');
  const open = src.indexOf('{', start);
  let depth = 0, inStr = false, strCh = '', end = -1;
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    if (inStr) {
      if (ch === '\\') { i++; continue; }
      if (ch === strCh) inStr = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (!depth) { end = i; break; } }
  }
  if (end > open) {
    const dict = eval('(function(){ ' + src.slice(start, end + 1) + '; return diccionario; })()');
    TRAD = (dict && dict.es) || {};
  }
} catch (e) {
  console.error('No se pudo cargar idioma.js:', e.message);
}

function resolveValue(v) {
  if (typeof v === 'string') {
    const t = v.trim();
    return TRAD[t] || v;
  }
  return v;
}

function resolveData(obj) {
  if (Array.isArray(obj)) return obj.map(resolveData);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const k of Object.keys(obj)) out[k] = resolveData(obj[k]);
    return out;
  }
  return resolveValue(obj);
}

data = resolveData(data);

let COUNTRY_CODES = Object.keys(data).filter(k => data[k] && data[k].nombre && !hasPlaceholder(data[k].nombre));

/* ───────────── clave y modelo Gemini (solo servidor) ───────────── */
function loadEnvVar(name) {
  if (process.env[name]) return String(process.env[name]).trim();
  try {
    const raw = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    const m = raw.match(new RegExp('^\\s*' + name + '\\s*=\\s*(.+?)\\s*$', 'm'));
    if (m) return m[1].replace(/^["']|["']$/g, '').trim();
  } catch (_) { /* sin .env */ }
  return null;
}
const GEMINI_API_KEY = loadEnvVar('GEMINI_API_KEY');
const GEMINI_MODEL = loadEnvVar('GEMINI_MODEL') || 'gemini-flash-latest';

/* ───────────── watch automático de data.json ───────────── */
const DATA_FILE = path.join(__dirname, '..', 'data', 'data.json');
let dataLastMtime = Number(fs.statSync(DATA_FILE).mtimeMs);

function checkDataRefresh() {
  try {
    const stat = fs.statSync(DATA_FILE);
    if (stat.mtimeMs !== dataLastMtime) {
      dataLastMtime = stat.mtimeMs;
      console.log('📡 Detectado cambio en data.json — recargando datos...');
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf8').replace(/^\uFEFF/, '');
        const newData = JSON.parse(raw);
        data = resolveData(newData);
        COUNTRY_CODES = Object.keys(data).filter(k => data[k] && data[k].nombre && !hasPlaceholder(data[k].nombre));
        indexData();
        console.log(`✅ Datos actualizados: ${KB.length} fragmentos, ${COUNTRY_CODES.length} países`);
      } catch (e) {
        console.error('❌ Error recargando data.json:', e.message);
      }
    }
  } catch (_) { /* archivo temporalmente inexistente */ }
}
setInterval(checkDataRefresh, 2000);

/* ────────────── endpoint de recarga manual ────────────── */
app.post('/api/refresh-data', (req, res) => {
  try {
    dataLastMtime = Number(fs.statSync(DATA_FILE).mtimeMs);
    checkDataRefresh();
    res.json({ status: 'ok', message: 'Datos recargados', chunks: KB.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ══════════════════════════════════════════════════════════════
   BASE DE CONOCIMIENTO (RAG)
   Cada fragmento: { id, code, country, section, title, text, kws }
   ══════════════════════════════════════════════════════════════ */
const KB = [];

// Detecta texto con placeholders corruptos tipo "paisColombia_nombre"
function hasPlaceholder(text) {
  return /pais[A-Za-z]+_[A-Za-z_]+/.test(String(text || '')) ||
         /^\{\{.*\}\}$/.test(String(text || '').trim());
}

function addChunk(code, country, section, title, text) {
  const txt = clean(text).replace(/\s+/g, ' ').trim();
  if (!txt) return;
  // descarta datos corruptos (nombre/país/título/texto con placeholders)
  if (hasPlaceholder(txt) || hasPlaceholder(country) || hasPlaceholder(title)) return;
  const kws = tokens(`${country || ''} ${title} ${txt}`);
  KB.push({ id: KB.length, code, country, section, title: clean(title) || section, text: txt, kws });
}

function joinParts(parts) {
  return parts.filter(Boolean).map(p => String(p).trim()).filter(Boolean).join('. ');
}

function indexData() {
  KB.length = 0;
  COUNTRY_CODES.forEach(code => {
    const c = data[code];
    const nombre = c.nombre;

    // Resumen del país
    addChunk(code, nombre, 'resumen', nombre, joinParts([
      `${nombre} — ${c.subtitulo || ''}`,
      c.tagline,
      c.descripcion,
      `Continente: ${c.continente}`,
      `Moneda: ${c.moneda}`,
      `Idioma: ${c.idioma}`,
      `Capital: ${c.capital}`,
      `Población: ${c.poblacion}`,
      `Zona horaria: ${c.zona_horaria}`,
      `Código telefónico: ${c.codigo_telefonico}`
    ]));

    // Cifras rápidas
    (c.stats || []).forEach(s => addChunk(code, nombre, 'estadísticas', `${s.label || 'Dato'} de ${nombre}`, `${s.label || ''}: ${s.valor || ''}`));
    if (Array.isArray(c.ticker) && c.ticker.length) {
      addChunk(code, nombre, 'cifras', `Cifras de ${nombre}`, c.ticker.join('. '));
    }

    // Datos curiosos
    (c.quick_facts || []).forEach(f => addChunk(code, nombre, 'datos curiosos', f.titulo, joinParts([f.titulo, f.texto])));

    // Lugares / destinos
    (c.destinos || []).forEach(d => addChunk(code, nombre, 'lugares', d.nombre, joinParts([
      d.nombre, d.tag, d.descripcion, d.detalle,
      d.consejo && `Consejo: ${d.consejo}`
    ])));

    // Cultura
    const cu = c.cultura;
    if (cu) {
      addChunk(code, nombre, 'cultura', `Cultura de ${nombre}`, joinParts([
        cu.descripcion,
        (cu.stats || []).map(s => `${s.label || ''}: ${s.valor || ''}`).join('. ')
      ]));
      (cu.items || []).forEach(it => addChunk(code, nombre, 'cultura', it.nombre || it.titulo, joinParts([
        it.nombre || it.titulo, it.tag, it.detalle || it.descripcion || it.texto
      ])));
      if (cu.dark_band) addChunk(code, nombre, 'cultura', cu.dark_band.titulo || 'Cultura', joinParts([cu.dark_band.titulo, cu.dark_band.texto]));
    }

    // Gastronomía
    const ga = c.gastronomia;
    if (ga) {
      addChunk(code, nombre, 'gastronomía', `Gastronomía de ${nombre}`, ga.descripcion);
      (ga.platos || []).forEach(p => addChunk(code, nombre, 'gastronomía', p.nombre, joinParts([
        p.nombre, p.categoria, p.descripcion, p.nota
      ])));
    }

    // Aventura
    const av = c.aventura;
    if (av) {
      addChunk(code, nombre, 'aventura', `Aventura en ${nombre}`, av.descripcion);
      (av.actividades || []).forEach(a => addChunk(code, nombre, 'aventura', a.nombre, joinParts([
        a.nombre, a.descripcion, a.duracion, a.dificultad, a.precio
      ])));
      if (av.dark_band) addChunk(code, nombre, 'aventura', av.dark_band.titulo || 'Aventura', joinParts([av.dark_band.titulo, av.dark_band.texto]));
    }

    // Info práctica
    const pr = c.practica;
    if (pr) {
      (pr.info_cards || []).forEach(card => addChunk(code, nombre, 'info práctica', `${card.titulo || card.icono} · ${nombre}`, joinParts([card.titulo, card.texto])));
      (pr.temporadas || []).forEach(s => addChunk(code, nombre, 'clima', `Temporada ${s.nombre} en ${nombre}`, joinParts([s.nombre, s.meses, s.descripcion])));
      (pr.itinerario || []).forEach(d => addChunk(code, nombre, 'itinerario', `Día ${d.dia} · ${d.titulo}`, joinParts([d.dia, d.titulo, d.texto])));
      if (pr.datos_rapidos) addChunk(code, nombre, 'info práctica', `Datos rápidos de ${nombre}`, pr.datos_rapidos);
    }

    // Historia
    const hi = c.historia;
    if (hi) {
      addChunk(code, nombre, 'historia', hi.titulo || `Historia de ${nombre}`, joinParts([hi.descripcion]));
      (hi.cronologia || []).forEach(e => addChunk(code, nombre, 'historia', `${e.titulo || 'Hito'}`, joinParts([e.año, e.titulo, e.texto])));
    }

    // Guías
    (c.guias || []).forEach(g => addChunk(code, nombre, 'guías', g.name, joinParts([
      `Guía en ${nombre}`,
      g.descripcion,
      (g.especialidades || []).join(', '),
      g.nivel,
      g.price && `Tarifa: $${g.price}/h`,
      g.idiomas && `Idiomas: ${g.idiomas}`
    ])));

    // Aerolíneas
    (c.aerolineas || []).forEach(a => addChunk(code, nombre, 'vuelos', a.nombre, joinParts([
      `Vuelos a ${nombre}`,
      a.descripcion,
      a.precio_desde && `Desde $${a.precio_desde} ${a.moneda || 'USD'}`
    ])));

    // Hospedajes
    (c.hospedajes || []).forEach(h => addChunk(code, nombre, 'hospedajes', h.nombre, joinParts([
      h.tipo, (h.ubicacion || h.barrio) && `Ubicación: ${h.ubicacion || h.barrio}`, h.descripcion,
      h.precio_noche && `$${h.precio_noche} ${h.moneda || 'USD'} por noche`
    ])));

    // Souvenirs
    (c.souvenirs || []).forEach(s => addChunk(code, nombre, 'souvenirs', s.nombre, joinParts([
      s.descripcion,
      (s.productos || []).map(p => joinParts([p.nombre, p.descripcion, p.precio])).join('. ')
    ])));
  });

  // Top 10 y paquetes (información general del sitio)
  if (data.top10) Object.values(data.top10).forEach(t => addChunk(null, 'KAVARI', 'top 10', t.title, joinParts([t.title, t.tag, t.desc, t.facts])));
  if (data.paquetes) Object.values(data.paquetes).forEach(p => addChunk(null, 'KAVARI', 'paquetes', p.title, joinParts([
    p.title, p.desc,
    (p.includes || []).join(', '),
    (p.itinerary || []).map(i => joinParts([i.titulo, i.texto])).join('. ')
  ])));

  console.log(`📚 Base de conocimiento: ${KB.length} fragmentos indexados (${COUNTRY_CODES.length} países).`);
}
indexData();

/* ───────────── recuperación (RAG) ───────────── */
function findCountryCodeByName(name) {
  if (!name) return null;
  const q = normalize(name);
  for (const code of COUNTRY_CODES) {
    const n = normalize(data[code].nombre);
    if (n === q || n.includes(q) || q.includes(n)) return code;
  }
  return null;
}

// Devuelve pares {ch, score} para que el router pueda medir la cobertura.
function retrieveScored(query, activeCode, topK = 6) {
  const qTokens = tokens(query);
  if (!qTokens.size) return [];
  const qArr = [...qTokens];

  const scored = KB.map(ch => {
    let score = 0;
    for (const t of qArr) if (ch.kws.has(t)) score += 1;
    // bigramas del título cuentan doble
    const titleNorm = normalize(ch.title);
    for (let i = 0; i < qArr.length - 1; i++) {
      if (titleNorm.includes(qArr[i] + ' ' + qArr[i + 1])) score += 2;
    }
    // el país activo se refuerza
    if (ch.code && ch.code === activeCode) score *= 1.6;
    if (ch.section === 'resumen' && ch.code === activeCode) score += 2;
    return { ch, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);

  return scored.slice(0, topK);
}

function retrieve(query, activeCode, topK = 6) {
  return retrieveScored(query, activeCode, topK).map(x => x.ch);
}

function buildContextText(results) {
  if (!results.length) return '';
  const parts = results.map((r, i) => `[${i + 1}] (${r.country || 'KAVARI'} · ${r.section}) ${r.title}:\n${r.text}`);
  return 'CONTEXTO KAVARI (responde ÚNICAMENTE con esta información):\n' + parts.join('\n\n');
}

/* ───────────── Gemini (REST, sin dependencias) ───────────── */
function geminiRequest(body) {
  return new Promise((resolve, reject) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
    const payload = JSON.stringify(body);
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, res => {
      let raw = '';
      res.on('data', d => { raw += d; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`Gemini HTTP ${res.statusCode}: ${raw.slice(0, 300)}`));
        }
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          reject(new Error('Gemini respuesta inválida'));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(32000, () => { req.destroy(new Error('Gemini timeout')); });
    req.write(payload);
    req.end();
  });
}

async function askGemini({ system, history, userMessage, contextText, useSearch }) {
  const contents = [];
  for (const turn of history) {
    contents.push({ role: turn.role === 'model' ? 'model' : 'user', parts: [{ text: turn.text }] });
  }
  contents.push({
    role: 'user',
    parts: [{ text: contextText ? `${contextText}\n\nPregunta del usuario: ${userMessage}` : userMessage }]
  });

  const body = {
    system_instruction: { parts: [{ text: system }] },
    contents,
    generationConfig: { temperature: 0.6, maxOutputTokens: 1000, topP: 0.95 }
  };
  // Búsqueda web nativa (Google Search Grounding): el modelo puede
  // consultar sitios externos en plena generación, sin API extra.
  if (useSearch) body.tools = [{ google_search: {} }];

  const resp = await geminiRequest(body);

  const text = (resp?.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
  if (!text) throw new Error('Gemini devolvió una respuesta vacía');

  // Fuentes web que usó la búsqueda (para mostrarlas en el chat).
  const meta = resp?.candidates?.[0]?.groundingMetadata;
  const seen = new Set();
  const sources = [];
  for (const c of (meta?.groundingChunks || [])) {
    const w = c?.web;
    if (!w?.uri || seen.has(w.uri)) continue;
    seen.add(w.uri);
    let host = '';
    try { host = new URL(w.uri).hostname.replace(/^www\./, ''); } catch (_) { /* uri rara */ }
    sources.push({
      uri: w.uri,
      host,
      title: clean(w.title || host || w.uri).slice(0, 90)
    });
    if (sources.length >= 4) break;
  }

  return { text, sources };
}

/* ───────────── prompt de sistema ───────────── */
function buildSystemPrompt(ctx, userInfo, hasContext, webSearchOn) {
  const langName = { es: 'Spanish', en: 'English', pt: 'Portuguese' }[ctx.lang] || 'Spanish';
  const name = userInfo?.name ? `The user's name is ${userInfo.name}. Address them by name naturally.` : '';
  const plan = userInfo?.plan ? `Their KAVARI plan is "${userInfo.plan}".` : '';
  const favs = userInfo?.favorites?.length ? `Their favorite countries in KAVARI are: ${userInfo.favorites.join(', ')}.` : '';
  const rules = [
    // 1) Plataforma: conocimiento oficial, cerrado.
    'PRIORITY 1 — Questions about the KAVARI platform (what it is, how it works, site pages, features, membership plans, prices, account, contact, social media): answer ONLY with the "CONOCIMIENTO OFICIAL DE LA PLATAFORMA KAVARI" section below. That info is official and complete; never invent features, prices or contacts beyond it.',
    // 2) Destinos: contexto RAG primero.
    hasContext
      ? 'PRIORITY 2 — Destination/country questions: base your answer on the "CONTEXTO KAVARI" attached to the message. You MAY enrich it with your general knowledge (or with what you find via web search), but never contradict or replace the context data.'
      : 'PRIORITY 2 — Destination questions with no attached context: use reliable general tourism knowledge.',
    // 3) Búsqueda web disponible.
    webSearchOn
      ? 'PRIORITY 3 — You HAVE the Google Search tool enabled for this turn. Use it whenever the answer benefits from fresh, specific or verifiable info: events, news, weather, entry requirements/visas, current prices, schedules, safety notices, things to do right now. Synthesize what you find in your own words and naturally mention the main source (e.g. "según el sitio oficial de...").'
      : '',
    // 4) Cualquier otra pregunta: lógica + conexión con turismo/KAVARI.
    'PRIORITY 4 — Any other question at all (general culture, history, geography, math, recommendations, comparisons, whatever): never refuse it as "out of domain". Answer briefly, accurately and logically, then CONNECT it back to travel/tourism when it fits naturally and suggest how KAVARI can help (a destination page, local guides, packages, membership plans). Example: if asked about a painter, mention the museum city where their works can be visited.',
    // Honestidad.
    'HONESTY: never invent specific prices, exact dates, availability, phone numbers or addresses. If you are not sure about something, say so briefly and offer alternatives you CAN help with.'
  ].filter(Boolean);
  return [
    'You are Kari, the friendly travel assistant of KAVARI, a platform with detailed tourism guides (culture, food, places, adventure, practical info, certified local guides, flights, stays, packages).',
    'Your mission: answer ANY question users ask — using logic and, when useful, information searched on external websites — but ALWAYS keeping the focus on tourism, travel planning and KAVARI.',
    `Always respond in ${langName} (match the language the website is showing).`,
    ...rules,
    'Style: concise 3-6 short lines, warm and professional. Simple formatting: **bold** for names/places and "-" lists. No markdown headers.',
    '',
    getPlatformKnowledge(),
    '',
    name, plan, favs,
    'End with one short follow-up question or suggestion related to their trip.'
  ].filter(Boolean).join('\n');
}

/* ───────────── router inteligente ───────────── */
// ¿La pregunta es sobre la plataforma KAVARI? → conocimiento oficial,
// no hace falta buscar en la web.
function isKavariPlatformQuestion(q) {
  const n = normalize(q);
  if (/\b(kavari|kavi)\b/.test(n)) return true;
  return /(membresia|suscripcion|plan viajero|plan premium|plan op|que planes tiene|cuales planes|cuanto cuesta el (premium|op)|como funciona (el sitio|la pagina|kavari)|paginas? del sitio|secciones del sitio|crear cuenta|iniciar sesion|borrar cuenta|cerrar sesion|favoritos|modo oscuro|cambiar idioma|newsletter|tutorial interactivo)/.test(n);
}

// Saludos y cortesías cortas: nunca disparan búsqueda web.
function isSmallTalk(q) {
  const n = normalize(q);
  return n.split(' ').length <= 3 &&
    /^(hola|buenas|hey|hi|hello|gracias|ok|okey|vale|adios|chao|saludos|que tal|como estas|todo bien|buenos dias|buenas tardes|buenas noches|jaja|ja)\b/.test(n);
}

// Señales de que conviene información fresca o externa a la ficha.
const WEB_HINTS_RE = new RegExp([
  'hoy', 'esta semana', 'este fin de semana', 'este mes', 'ahora', 'actualmente', '\\bactual\\b',
  'ultima[s]? hora', 'ultim[oa]s? ', 'reciente[s]?', 'noticia[s]?', 'evento[s]?', 'festival(es)?',
  'concierto[s]?', 'agenda', 'calendario', 'pronostic', 'temperatura hoy', 'clima hoy',
  'dolar', 'tipo de cambio', 'requisito[s]?', 'visa', 'visado', 'pasaporte', 'embajada',
  'frontera', 'abierto', 'cerrado', 'horario', 'seguridad', 'peligroso?', 'prohibido',
  'alerta', 'recomendad[oa]s? ahora', '20(2[5-9]|3[0-9])'
].join('|'));

function needsWebSearch(message, bestScore) {
  const q = String(message || '');
  if (isSmallTalk(q)) return false;
  if (isKavariPlatformQuestion(q)) return false;
  if (WEB_HINTS_RE.test(normalize(q))) return true;
  // Poca cobertura en la base local → deja que la IA busque en la web.
  return bestScore < 2 && normalize(q).split(' ').length >= 4;
}

/* ---------- funciones de ayuda para detección de intenciones ---------- */
function isGeneralKAVARIQuestion(q) {
  const qNorm = normalize(q);
  const generalKeywords = [
    'que es kavari', 'que es kavari', 'what is kavari', 'what is kavari',
    'como funciona kavari', 'how does kavari work', 'que es kari', 'who is kari', 'who is kavi',
    'para que sirve kari',
    'what is kavi', 'kavari 소개', 'kavari nedir'
  ];
  return generalKeywords.some(kw => qNorm.includes(kw));
}

/* ---------- respuesta general sobre KAVARI (solo fallback sin IA) ---------- */
function getGeneralKAVARIReply(en) {
  const es = `**KAVARI** es una plataforma de viajes para descubrir y planificar tu próxima aventura:
- **Destinos** con guías completas: cultura, gastronomía, lugares imperdibles e info práctica.
- **Paquetes de viaje**, **guías locales certificados**, aerolíneas y hospedajes.
- **Asistente IA** (yo, Kari) disponible en todo el sitio.
- **Planes**: Viajero (gratis), Premium (US$9.99/mes) y OP (US$19.99/mes).
- Multiidioma (ES/EN/PT), modo oscuro y tutorial interactivo.
¿Quieres que te cuente sobre algún destino o sobre los planes?`;
  if (en) return `**KAVARI** is a travel platform to discover and plan your next adventure:
- **Destinations** with complete guides: culture, food, must-see places and practical info.
- **Travel packages**, **certified local guides**, flights and stays.
- **AI assistant** (me, Kari) available across the whole site.
- **Plans**: Viajero (free), Premium (US$9.99/mo) and OP (US$19.99/mo).
- Multilingual (ES/EN/PT), dark mode and an interactive tutorial.
Want me to tell you about a destination or about the plans?`;
  return es;
}

/* ───────────── fallback local (sin IA) ───────────── */
function fallbackAnswer(q, ctx, results) {
  const en = ctx.lang === 'en';
  if (!results.length) {
    const topics = en
      ? ['destinations', 'places', 'food', 'culture', 'adventure', 'guides', 'flights', 'stays', 'visas & currency', 'weather', 'history', 'souvenirs']
      : ['destinos', 'lugares', 'gastronomía', 'cultura', 'aventura', 'guías', 'vuelos', 'hospedajes', 'visas y moneda', 'clima', 'historia', 'souvenirs'];
    return en
      ? `I could not find that exact information in KAVARI. I can help you with: ${topics.join(', ')}. You can also tell me a specific country (for example "tell me about Mexico").`
      : `No encontré información exacta sobre eso en KAVARI. Puedo ayudarte con: ${topics.join(', ')}. También puedes decirme un país concreto (por ejemplo "cuéntame de México").`;
  }

  const lines = results.slice(0, 4).map(r => `**${r.title}** (${r.country || 'KAVARI'} · ${r.section})\n${truncate(r.text, 260)}`);
  const intro = en
    ? `According to the information published on KAVARI:`
    : `Según la información publicada en KAVARI:`;
  const outro = en
    ? `\n\nDo you want me to go deeper into any of these?`
    : `\n\n¿Quieres que profundice en alguno de estos temas?`;
  return `${intro}\n\n${lines.join('\n\n')}${outro}`;
}

/* ───────────── endpoints ───────────── */
app.post('/api/chat', async (req, res) => {
  try {
    const { message, context, history, user } = req.body || {};
    if (!message || !String(message).trim()) {
      return res.status(400).json({ reply: 'Message is required.' });
    }

    const ctx = {
      country: context?.country || null,
      guias: context?.guias || [],
      aerolineas: context?.aerolineas || [],
      hospedajes: context?.hospedajes || [],
      lang: ['es', 'en', 'pt'].includes(context?.lang) ? context.lang : 'es'
    };

    // País activo: el de la ficha abierta o el que se mencione en la pregunta.
    const activeCode = ctx.country?.code
      || findCountryCodeByName(ctx.country?.nombre)
      || findCountryCodeByName(String(message));

    const scored = retrieveScored(String(message), activeCode, 6);
    const results = scored.map(x => x.ch);
    const bestScore = scored.length ? scored[0].score : 0;

    const userInfo = {
      name: user?.name ? String(user.name).slice(0, 60) : null,
      plan: user?.plan ? String(user.plan).slice(0, 40) : null,
      favorites: Array.isArray(user?.favorites) ? user.favorites.slice(0, 20).map(String) : []
    };

    const historyArr = (Array.isArray(history) ? history : [])
      .slice(-20)
      .map(h => ({
        role: h?.role === 'model' ? 'model' : 'user',
        text: String(h?.text || '').slice(0, 2000)
      }))
      .filter(h => h.text.trim());

    // ROUTER: ¿basta el conocimiento local o conviene buscar en la web?
    const wantsSearch = needsWebSearch(String(message), bestScore);

    let reply = null;
    let sources = [];
    if (GEMINI_API_KEY) {
      try {
        const out = await askGemini({
          system: buildSystemPrompt(ctx, userInfo, results.length > 0, wantsSearch),
          history: historyArr,
          userMessage: String(message).slice(0, 2000),
          contextText: buildContextText(results),
          useSearch: wantsSearch
        });
        reply = out.text;
        sources = out.sources || [];
      } catch (err) {
        console.error(`⚠️ Gemini error${wantsSearch ? ' (con búsqueda web)' : ''}:`, err.message);
        if (wantsSearch) {
          // Reintento sin herramienta: algunos modelos pueden rechazarla.
          try {
            const out2 = await askGemini({
              system: buildSystemPrompt(ctx, userInfo, results.length > 0, false),
              history: historyArr,
              userMessage: String(message).slice(0, 2000),
              contextText: buildContextText(results),
              useSearch: false
            });
            reply = out2.text;
            sources = out2.sources || [];
          } catch (err2) {
            console.error('⚠️ Gemini reintento sin búsqueda falló:', err2.message);
          }
        }
      }
    }
    if (!reply) {
      reply = isGeneralKAVARIQuestion(String(message))
        ? getGeneralKAVARIReply(ctx.lang === 'en')
        : fallbackAnswer(String(message), ctx, results);
    }

    res.json({ reply, intent: 'ai', searched: wantsSearch, sources });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ reply: 'Lo siento, ocurrió un error al procesar tu mensaje.' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', gemini: !!GEMINI_API_KEY, model: GEMINI_MODEL, chunks: KB.length, timestamp: new Date().toISOString() });
});

app.get('/api/countries', (req, res) => {
  const countries = COUNTRY_CODES.map(code => ({
    code,
    nombre: data[code].nombre,
    bandera: data[code].bandera,
    continente: data[code].continente
  }));
  res.json(countries);
});

app.get('/api/country/:code', (req, res) => {
  const c = data[req.params.code];
  if (!c) return res.status(404).json({ error: 'Country not found' });
  res.json(c);
});

app.listen(PORT, () => {
  console.log(`🤖 KAVARI Chat API v3 en http://localhost:${PORT}`);
  console.log(`   Gemini: ${GEMINI_API_KEY ? '✅ configurada (' + GEMINI_MODEL + ')' : '❌ sin clave — modo fallback local'}`);
  console.log(`   POST /api/chat · GET /api/health · GET /api/countries · GET /api/country/:code`);
});
