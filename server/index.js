/* ══════════════════════════════════════════════════════════════════
   KAVARI · API de datos
   ----------------------------------------------------------------
   Sirve data.json resuelto (con traducciones) para el frontend.
   El chatbot está gestionado por Botpress (externo).
   ══════════════════════════════════════════════════════════════════ */
'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3007;

const ALLOWED_ORIGINS = [
  'http://localhost:5501',
  'http://localhost:3007',
  'http://127.0.0.1:5501',
  'https://kavariwebsite.com',
  'https://www.kavariwebsite.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ['GET'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '2mb' }));

/* ───────────── utilidades ───────────── */
const clean = value => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

/* ───────────── datos del sitio ───────────── */
let data = {};
try {
  data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'data.json'), 'utf8').replace(/^\uFEFF/, ''));
} catch (e) {
  console.error('No se pudo cargar data.json:', e.message);
}

/* ───────────── diccionario ES (idioma.js) para resolver claves ───────────── */
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
    const objText = src.slice(start, end + 1);
    const fn = new Function('return ' + objText.replace(/^const\s+diccionario\s*=\s*/, ''));
    const dict = fn();
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

let COUNTRY_CODES = Object.keys(data).filter(k => data[k] && data[k].nombre && !/pais[A-Za-z]+_[A-Za-z_]+/.test(data[k].nombre));

/* ───────────── watch de data.json ───────────── */
const DATA_FILE = path.join(__dirname, '..', 'data', 'data.json');
let dataLastMtime = Number(fs.statSync(DATA_FILE).mtimeMs);

function checkDataRefresh() {
  try {
    const stat = fs.statSync(DATA_FILE);
    if (stat.mtimeMs !== dataLastMtime) {
      dataLastMtime = stat.mtimeMs;
      console.log('Detectado cambio en data.json — recargando...');
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf8').replace(/^\uFEFF/, '');
        const newData = JSON.parse(raw);
        data = resolveData(newData);
        COUNTRY_CODES = Object.keys(data).filter(k => data[k] && data[k].nombre && !/pais[A-Za-z]+_[A-Za-z_]+/.test(data[k].nombre));
        console.log(`Datos actualizados: ${COUNTRY_CODES.length} paises`);
      } catch (e) {
        console.error('Error recargando data.json:', e.message);
      }
    }
  } catch (_) { /* archivo temporalmente inexistente */ }
}
setInterval(checkDataRefresh, 5000);

/* ───────────── endpoints ───────────── */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', countries: COUNTRY_CODES.length, timestamp: new Date().toISOString() });
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
  console.log(`KAVARI API de datos en http://localhost:${PORT}`);
  console.log(`   ${COUNTRY_CODES.length} paises cargados`);
  console.log(`   GET /api/health · GET /api/countries · GET /api/country/:code`);
});
