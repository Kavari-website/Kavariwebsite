/* ══════════════════════════════════════════════════════════════════
   KAVARI Chat API · v3 — Asistente con IA + memoria + RAG
   ----------------------------------------------------------------
   - Base de conocimiento: indexa todo data/data.json (37 países +
     top 10 + paquetes) en fragmentos ("chunks") con palabras clave.
   - Recuperación (RAG): por cada pregunta puntúa los fragmentos por
     coincidencia de términos y frases; usa el país activo como refuerzo.
   - Respuesta: Gemini (gemini-2.5-flash) con instrucciones de sistema,
     historial de conversación (memoria) y el contexto recuperado.
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
const COUNTRY_CODES = Object.keys(data).filter(k => data[k] && data[k].nombre);

/* ───────────── clave Gemini (solo servidor) ───────────── */
function loadGeminiKey() {
  if (process.env.GEMINI_API_KEY) return String(process.env.GEMINI_API_KEY).trim();
  try {
    const raw = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    const m = raw.match(/^\s*GEMINI_API_KEY\s*=\s*(.+?)\s*$/m);
    if (m) return m[1].replace(/^["']|["']$/g, '').trim();
  } catch (_) { /* sin .env */ }
  return null;
}
const GEMINI_API_KEY = loadGeminiKey();
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

/* ══════════════════════════════════════════════════════════════
   BASE DE CONOCIMIENTO (RAG)
   Cada fragmento: { id, code, country, section, title, text, kws }
   ══════════════════════════════════════════════════════════════ */
const KB = [];

function addChunk(code, country, section, title, text) {
  const txt = clean(text).replace(/\s+/g, ' ').trim();
  if (!txt) return;
  const kws = tokens(`${country || ''} ${title} ${txt}`);
  KB.push({ id: KB.length, code, country, section, title: clean(title) || section, text: txt, kws });
}

function joinParts(parts) {
  return parts.filter(Boolean).map(p => String(p).trim()).filter(Boolean).join('. ');
}

function indexData() {
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
      h.tipo, `Barrio: ${h.barrio}`, h.descripcion,
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

function retrieve(query, activeCode, topK = 6) {
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

  return scored.slice(0, topK).map(x => x.ch);
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
    req.setTimeout(25000, () => { req.destroy(new Error('Gemini timeout')); });
    req.write(payload);
    req.end();
  });
}

async function askGemini({ system, history, userMessage, contextText }) {
  const contents = [];
  for (const turn of history) {
    contents.push({ role: turn.role === 'model' ? 'model' : 'user', parts: [{ text: turn.text }] });
  }
  contents.push({
    role: 'user',
    parts: [{ text: contextText ? `${contextText}\n\nPregunta del usuario: ${userMessage}` : userMessage }]
  });

  const resp = await geminiRequest({
    system_instruction: { parts: [{ text: system }] },
    contents,
    generationConfig: { temperature: 0.6, maxOutputTokens: 900, topP: 0.95 }
  });

  const text = (resp?.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
  if (!text) throw new Error('Gemini devolvió una respuesta vacía');
  return text;
}

/* ───────────── prompt de sistema ───────────── */
function buildSystemPrompt(ctx, userInfo) {
  const lang = ctx.lang === 'en' ? 'English' : 'Spanish';
  const name = userInfo?.name ? `The user's name is ${userInfo.name}. Address them by name naturally.` : '';
  const plan = userInfo?.plan ? `Their KAVARI plan is "${userInfo.plan}".` : '';
  const favs = userInfo?.favorites?.length ? `Their favorite countries in KAVARI are: ${userInfo.favorites.join(', ')}.` : '';
  return [
    'You are Kari, the friendly travel assistant of KAVARI, a platform with detailed tourism information for 37 countries (culture, food, places, adventure, practical info, guides, flights, stays, history, souvenirs).',
    `Always respond in ${lang} (match the language the website is showing).`,
    'Answer ONLY using the information in "CONTEXTO KAVARI" included in the last user message. Never invent prices, places, dates or data that are not in that context.',
    'If the context does not cover the question, say honestly that KAVARI does not have that information and suggest 2 related topics you CAN help with.',
    'If the user asks about another country, use the context available for that country.',
    'Be concise: 3-6 short lines, warm and professional. Use simple formatting: **bold** for names/places and "-" for lists. No markdown headers.',
    name, plan, favs,
    'End with one short follow-up question or suggestion related to their trip.'
  ].filter(Boolean).join('\n');
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
      lang: context?.lang === 'en' ? 'en' : 'es'
    };

    const activeCode = ctx.country?.code || findCountryCodeByName(ctx.country?.nombre);
    const results = retrieve(String(message), activeCode, 6);

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

    let reply = null;
    if (GEMINI_API_KEY) {
      try {
        reply = await askGemini({
          system: buildSystemPrompt(ctx, userInfo),
          history: historyArr,
          userMessage: String(message).slice(0, 2000),
          contextText: buildContextText(results)
        });
      } catch (err) {
        console.error('⚠️ Gemini error, usando fallback local:', err.message);
      }
    }
    if (!reply) reply = fallbackAnswer(String(message), ctx, results);

    res.json({ reply, intent: 'ai' });
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
