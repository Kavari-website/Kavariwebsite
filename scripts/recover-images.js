#!/usr/bin/env node
/**
 * KAVARI · Recuperador de imágenes reales
 * ----------------------------------------
 * Reemplaza los placeholders SVG (los "símbolos" que el usuario rechaza)
 * por fotografías reales libres de Wikimedia Commons.
 *
 * Para cada referencia img/*.svg de data/data.json cuyo archivo sea un
 * placeholder KAVARI:
 *   1. Extrae la etiqueta del texto del SVG (nombre del destino/plato/
 *      sección) + el país, y construye una búsqueda.
 *   2. Consulta la API de Wikimedia Commons y descarga la mejor foto
 *      (prefiere JPEG, horizontal, ≥800px).
 *   3. La guarda como img/<pais>/<mismo nombre>.jpg y actualiza la ruta
 *      en data/data.json.
 *
 * Es reanudable: si el archivo destino ya existe y data.json ya apunta a
 * él, se omite.
 *
 * Uso:  node scripts/recover-images.js [--countries pais1,pais2] [--limit N]
 *       node scripts/recover-images.js --dry-run
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'data.json');
const IS_OURS = /KAVARI placeholder|&#9992;/;

const UA = 'KavariWebsite/1.0 (recovery script; contact: kavariwebsite@gmail.com)';
const API = 'https://commons.wikimedia.org/w/api.php';

const COUNTRY_EN = {
  argentina: 'Argentina', brasil: 'Brazil', chile: 'Chile', colombia: 'Colombia',
  'costa-rica': 'Costa Rica', cuba: 'Cuba', mexico: 'Mexico', panama: 'Panama',
  peru: 'Peru', 'republica-dominicana': 'Dominican Republic', espana: 'Spain',
  francia: 'France', grecia: 'Greece', italia: 'Italy', japon: 'Japan',
  marruecos: 'Morocco', portugal: 'Portugal', sudafrica: 'South Africa',
  tailandia: 'Thailand', turquia: 'Turkey', venezuela: 'Venezuela',
  bahamas: 'Bahamas', belice: 'Belize', bolivia: 'Bolivia', ecuador: 'Ecuador',
  'el-salvador': 'El Salvador', guatemala: 'Guatemala', guyana: 'Guyana',
  haiti: 'Haiti', honduras: 'Honduras', jamaica: 'Jamaica', nicaragua: 'Nicaragua',
  paraguay: 'Paraguay', 'puerto-rico': 'Puerto Rico',
  'trinidad-y-tobago': 'Trinidad and Tobago', uruguay: 'Uruguay',
  'el salvador': 'El Salvador', 'republica dominicana': 'Dominican Republic',
  'trinidad y tobago': 'Trinidad and Tobago',
};

const SECTION_EN = {
  cultura: 'culture', gastronomia: 'food', historia: 'history',
  aventura: 'adventure', practica: 'travel', destinos: 'places',
  souvenirs: 'handicraft', hospedajes: 'hotel',
};

// Sinónimos de platos/lugares que Commons no encuentra con el nombre exacto
const ALIASES = {
  metemgee: ['Metemgee Guyana', 'Guyanese food'],
  puertoespana: ['Port of Spain Trinidad', 'Port of Spain'],
  bakeshark: ['Bake and Shark Trinidad', 'Shark sandwich'],
  currychicken: ['Chicken curry Caribbean'],
  aloopie: ['Aloo pie Trinidad', 'Doubles Trinidad'],
  currygoat: ['Curry goat Caribbean'],
  riceandpeas: ['Rice and peas Jamaica', 'Jamaican rice and peas'],
  bombaplena: ['Bomba y plena Puerto Rico', 'Puerto Rican music'],
  arrozcongandules: ['Arroz con gandules Puerto Rico', 'Rice with pigeon peas'],
  lechonasado: ['Lechon asado Puerto Rico', 'Roast pork Puerto Rico'],
  pescadofrito: ['Fried fish Caribbean', 'Fried fish'],
  platanosenmiel: ['Plantains in honey', 'Sweet plantains'],
  paradiseisland: ['Paradise Island Bahamas', 'Atlantis Bahamas'],
  conchsalad: ['Conch salad Bahamas', 'Conch salad'],
  crackedconch: ['Cracked conch', 'Conch fritters'],
  peasrice: ['Peas and rice', 'Pigeon peas and rice Caribbean'],
  guavaduff: ['Guava duff', 'Guava dessert'],
  bassinbleu: ['Bassin Bleu Haiti', 'Bassin bleu Jacmel'],
  campcoquin: ['Camp Coquin Haiti', 'Kenscoff Haiti'],
  diriakpwa: ['Diri ak pwa', 'Haitian rice and beans'],
  poulfri: ['Poul fri', 'Haitian fried chicken'],
  bannannpeze: ['Bannann peze', 'Haitian fried plantains'],
  sospwa: ['Sos pwa', 'Haitian bean sauce'],
  painpatate: ['Pain patate', 'Haitian sweet potato bread'],
  rondabolla: ['Sopa de caracol', 'Conch soup'],
  patatasbravas: ['Patatas bravas', 'Spanish potatoes'],
  vinhoporto: ['Port wine Portugal', 'Porto wine cellar'],
  pastelnata: ['Pastel de nata', 'Portuguese custard tart'],
  caldoverde: ['Caldo verde', 'Portuguese green soup'],
  padseeew: ['Pad see ew', 'Thai fried noodles'],
  mangostickyrice: ['Mango sticky rice', 'Thai mango dessert'],
  padkrapao: ['Pad kra pao', 'Thai basil stir fry'],
  thaitea: ['Thai iced tea', 'Thai tea'],
  moroccansalad: ['Moroccan salad', 'Moroccan cuisine'],
};

// Capitales / ciudades icónicas para búsquedas de cabecera
const CAPITALS = {
  argentina: 'Buenos Aires', brasil: 'Rio de Janeiro', chile: 'Santiago de Chile',
  colombia: 'Bogota', 'costa-rica': 'San Jose', cuba: 'Havana', mexico: 'Mexico City',
  panama: 'Panama City', peru: 'Lima', 'republica-dominicana': 'Santo Domingo',
  espana: 'Madrid', francia: 'Paris', grecia: 'Athens', italia: 'Rome', japon: 'Tokyo',
  marruecos: 'Marrakesh', portugal: 'Lisbon', sudafrica: 'Cape Town', tailandia: 'Bangkok',
  turquia: 'Istanbul', venezuela: 'Caracas', bahamas: 'Nassau', belice: 'Belize',
  bolivia: 'La Paz', ecuador: 'Quito', 'el-salvador': 'San Salvador',
  guatemala: 'Antigua Guatemala', guyana: 'Georgetown', haiti: 'Port-au-Prince',
  honduras: 'Tegucigalpa', jamaica: 'Kingston', nicaragua: 'Granada',
  paraguay: 'Asuncion', 'puerto-rico': 'San Juan',
  'trinidad-y-tobago': 'Port of Spain', uruguay: 'Montevideo',
};

const args = process.argv.slice(2);
const countriesArg = (args.find(a => a.startsWith('--countries=')) || '').split('=')[1];
const limitArg = Number((args.find(a => a.startsWith('--limit=')) || '--limit=0').split('=')[1]) || 0;
const dryRun = args.includes('--dry-run');

/* ---------------------------------------------------------------- */
/* Utilidades                                                        */
/* ---------------------------------------------------------------- */
function isPlaceholderFile(file) {
  try {
    const fd = fs.openSync(file, 'r');
    const buf = Buffer.alloc(512);
    const bytes = fs.readSync(fd, buf, 0, 512, 0);
    fs.closeSync(fd);
    return IS_OURS.test(buf.toString('utf8', 0, bytes));
  } catch (_) { return false; }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

/** Extrae las líneas <text>...</text> de un SVG placeholder. */
function parseSvgLabels(file) {
  const src = fs.readFileSync(file, 'utf8');
  const texts = [];
  const re = /<text[^>]*>([^<]*)<\/text>/g;
  let m;
  while ((m = re.exec(src))) {
    const t = m[1].replace(/&#9992;/, '').trim();
    if (t && t !== 'KAVARI') texts.push(t);
  }
  return texts; // [etiqueta, sección, país] (para cards) o [país] (headers)
}

function titleCase(s) {
  return String(s)
    .replace(/[-_.]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/* ---------------------------------------------------------------- */
/* Búsqueda en Wikimedia Commons                                     */
/* ---------------------------------------------------------------- */
function scoreImage(info) {
  const mime = info.mime || '';
  let score = 0;
  if (mime === 'image/jpeg') score += 100;
  else if (mime === 'image/png') score += 70;
  else if (mime === 'image/webp') score += 60;
  else if (mime === 'image/tiff') score += 20;
  else if (mime === 'image/svg+xml') score -= 200;
  else score += 10;
  const w = info.width || 0, h = info.height || 0;
  if (w >= h) score += 40; else score -= 40;      // horizontal
  if (w >= 1200) score += 30;
  else if (w >= 800) score += 15;
  else if (w < 400) score -= 60;
  if (w < 200 || h < 200) score -= 100;           // miniaturas
  return score;
}

async function searchCommons(query) {
  const url = `${API}?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(query)}` +
    '&gsrnamespace=6&gsrlimit=20&gsrfiletype=bitmap&prop=imageinfo&iiprop=url%7Csize%7Cmime&iiurlwidth=1280';
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`Commons API HTTP ${res.status}`);
  const j = await res.json();
  const pages = j.query && j.query.pages ? Object.values(j.query.pages) : [];
  if (!pages.length) return null;
  let best = null, bestScore = -Infinity;
  for (const p of pages) {
    const info = p.imageinfo && p.imageinfo[0];
    if (!info || !info.thumburl) continue;
    const s = scoreImage(info);
    if (s > bestScore) { bestScore = s; best = info; }
  }
  return best;
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Download HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

/* ---------------------------------------------------------------- */
/* Construcción de consultas                                         */
/* ---------------------------------------------------------------- */
function buildQueries(country, filePath, labels) {
  const en = COUNTRY_EN[country] || titleCase(country);
  const base = path.basename(filePath, '.svg').toLowerCase();
  const [label, section, ctryName] = labels;
  const queries = [];
  if (base === 'header') {
    const cap = CAPITALS[country] || en;
    queries.push(`${en} ${cap}`);
    queries.push(cap);
    queries.push(`${en} skyline`);
    queries.push(en);
  } else if (base.endsWith('-header')) {
    const secKey = base.replace('-header', '');
    const secEn = SECTION_EN[secKey] || secKey;
    queries.push(`${en} ${secEn}`);
    queries.push(`${en} ${secKey}`);
    queries.push(en);
  } else if (base === 'bannerdepuertorico') {
    queries.push('Puerto Rico San Juan');
  } else {
    const core = label && label !== ctryName ? `${label} ${en}` : `${titleCase(base)} ${en}`;
    queries.push(core);
    if (label && label !== ctryName) queries.push(`${label}`);
    queries.push(`${titleCase(base)}`);
    if (section === 'GASTRONOMÍA') queries.push(`${core} food`);
    // Nombres sin resultados en Commons → sinónimos/platos relacionados reales
    const aliases = ALIASES[base] || (label && ALIASES[label.toLowerCase().replace(/\s+/g, '')]);
    if (aliases) queries.push(...aliases);
  }
  // quitar duplicados
  return [...new Set(queries.map(q => q.replace(/\s+/g, ' ').trim()).filter(Boolean))];
}

/* ---------------------------------------------------------------- */
/* Recorrido de data.json                                            */
/* ---------------------------------------------------------------- */
function collectJobs(data) {
  const jobs = []; // { country, path, svgPath }
  function walk(obj, country) {
    if (Array.isArray(obj)) { for (const i of obj) walk(i, country); return; }
    if (!obj || typeof obj !== 'object') return;
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (typeof v === 'string' && v.startsWith('img/')) {
        const fp = path.join(ROOT, v.replace(/\//g, path.sep));
        // Trabajo si: es un placeholder SVG, o el archivo no existe en disco
        // (p. ej. un .jpg que se borró y aún se referencia).
        const exists = fs.existsSync(fp);
        if (!exists || (path.extname(v).toLowerCase() === '.svg' && isPlaceholderFile(fp))) {
          jobs.push({ country, path: v, svgPath: exists && fp });
        }
        continue;
      }
      walk(v, country);
    }
  }
  for (const key of Object.keys(data)) {
    if (key === 'top10' || key === 'paquetes') continue;
    walk(data[key], key);
  }
  return jobs;
}

/* ---------------------------------------------------------------- */
/* Main                                                              */
/* ---------------------------------------------------------------- */
async function main() {
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  const hasBom = raw.charCodeAt(0) === 0xFEFF || raw.startsWith('\uFEFF');
  const data = JSON.parse(hasBom ? raw.slice(1) : raw);
  let jobs = collectJobs(data);

  if (countriesArg) {
    const want = countriesArg.split(',').map(s => s.trim());
    jobs = jobs.filter(j => want.includes(j.country));
  }
  console.log(`Trabajos pendientes: ${jobs.length}`);

  if (dryRun) {
    const byC = {};
    for (const j of jobs) byC[j.country] = (byC[j.country] || 0) + 1;
    for (const [c, n] of Object.entries(byC)) console.log(`  ${c}: ${n}`);
    return;
  }

  let ok = 0, fail = 0, skipped = 0;
  const failures = [];
  let text = raw;
  const rewrite = oldPath => {
    const needle = '"' + oldPath + '"';
    if (text.includes(needle)) {
      text = text.split(needle).join('"' + oldPath.replace(/\.[a-z0-9]+$/i, '.jpg') + '"');
      return true;
    }
    return false;
  };

  for (let i = 0; i < jobs.length; i++) {
    const { country, path: oldPath, svgPath } = jobs[i];
    if (limitArg && i >= limitArg) break;
    const newPath = oldPath.replace(/\.[a-z0-9]+$/i, '.jpg');
    const target = path.join(ROOT, newPath.replace(/\//g, path.sep));

    if (fs.existsSync(target) && !isPlaceholderFile(target)) {
      if (rewrite(oldPath)) skipped++;
      continue;
    }
    if (oldPath.includes('.jpg') && fs.existsSync(target)) { skipped++; continue; }

    try {
      // La etiqueta se lee del SVG placeholder original (si aún existe);
      // si no, se deriva del nombre de archivo.
      const labels = svgPath ? parseSvgLabels(svgPath) : [];
      const queries = buildQueries(country, oldPath, labels);
      let info = null;
      for (const q of queries) {
        try {
          info = await searchCommons(q);
          if (info) break;
        } catch (_) { /* reintentar con siguiente consulta */ }
        await sleep(250);
      }
      if (!info) throw new Error('sin resultados');

      fs.mkdirSync(path.dirname(target), { recursive: true });
      await download(info.thumburl, target);
      if (isPlaceholderFile(target) || fs.statSync(target).size < 2000) {
        fs.unlinkSync(target);
        throw new Error('descarga inválida');
      }
      const did = rewrite(oldPath);
      console.log(`✔ [${country}] ${path.basename(oldPath)} → ${path.basename(newPath)}${did ? '' : ' (no ref en texto)'}`);
      ok++;
      // Politesse: pausa entre peticiones
      await sleep(120 + Math.random() * 250);
    } catch (e) {
      fail++;
      failures.push(`${oldPath} :: ${e.message}`);
      console.log(`✖ [${country}] ${oldPath} :: ${e.message}`);
      await sleep(300);
    }
  }

  const changed = text !== raw;
  if (changed) {
    fs.writeFileSync(DATA_FILE, text, 'utf8');
    console.log(`\n✔ data/data.json actualizado`);
  }
  console.log(`\nResumen: ${ok} OK, ${fail} fallos, ${skipped} ya listas`);
  if (failures.length) {
    console.log('\n--- Fallos ---');
    failures.forEach(f => console.log('  ' + f));
  }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
