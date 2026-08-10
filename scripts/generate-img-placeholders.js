#!/usr/bin/env node
/**
 * KAVARI · Generador de placeholders para imágenes faltantes
 * -----------------------------------------------------------
 * Recorre data/data.json y crea un placeholder SVG con la identidad
 * de KAVARI para cada imagen local (img/...) referenciada que NO
 * exista en disco. También elimina el BOM de data.json.
 *
 * - Los SVG llevan extensión .svg (MIME correcto al servirlos) y la
 *   marca `<!-- KAVARI placeholder -->` (se regeneran en cada run).
 * - Si más adelante añades la foto real (ej. img/ecuador/quito.jpg),
 *   al volver a ejecutar el script la ruta de data.json se revierte
 *   automáticamente al archivo real.
 * - El nombre mostrado se resuelve desde js/idioma.js (traducciones ES
 *   reales, ej. "paisPanama_destinos_canal_nombre" → "Canal de Panamá").
 *
 * Uso:  node scripts/generate-img-placeholders.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'data.json');
const IDIOMA_FILE = path.join(ROOT, 'js', 'idioma.js');
const MARKER = '<!-- KAVARI placeholder -->';
const IS_OURS = /KAVARI placeholder|&#9992;/;

/* ---------------------------------------------------------------- */
/* 1. Traducciones ES desde idioma.js (diccionario plano)           */
/* ---------------------------------------------------------------- */
function parseStringLit(s) {
  if (typeof s !== 'string' || s.length < 2) return null;
  if (s[0] === '"') {
    try { return JSON.parse(s); } catch (_) { return null; }
  }
  if (s[0] === "'") {
    // unescape simple para literales de comilla simple
    return s.slice(1, -1).replace(/\\(['"\\bfnrtv])/g, '$1');
  }
  return null;
}

function loadEsTranslations() {
  const src = fs.readFileSync(IDIOMA_FILE, 'utf8');
  // El bloque "es" termina donde empieza el bloque "en"
  const enIdx = src.search(/\ben\s*:\s*\{/);
  const esSrc = enIdx > -1 ? src.slice(0, enIdx) : src;
  const map = new Map();
  const lineRe = /^\s*["']?([A-Za-z_$][\w$]*)["']?\s*:\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')\s*,?\s*$/gm;
  let m;
  while ((m = lineRe.exec(esSrc)) !== null) {
    const val = parseStringLit(m[2]);
    if (val !== null) map.set(m[1], val);
  }
  return map;
}

/* ---------------------------------------------------------------- */
/* 2. Utilidades de formato                                          */
/* ---------------------------------------------------------------- */
const SECTION_LABELS = {
  destinos: 'DESTINOS',
  cultura: 'CULTURA',
  gastronomia: 'GASTRONOMÍA',
  aventura: 'AVENTURA',
  practica: 'INFO PRÁCTICA',
  souvenirs: 'SOUVENIRS',
  hospedajes: 'HOSPEDAJES',
  aerolineas: 'AEROLÍNEAS',
  historia: 'HISTORIA',
  guias: 'GUÍAS',
};

const COUNTRY_NAMES = {
  'el-salvador': 'El Salvador',
  'costa-rica': 'Costa Rica',
  'trinidad-y-tobago': 'Trinidad y Tobago',
  'republica-dominicana': 'República Dominicana',
  'republica dominicana': 'República Dominicana',
  'puerto-rico': 'Puerto Rico',
};

function titleCase(str) {
  return String(str)
    .replace(/[-_.]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const countryLabel = key => COUNTRY_NAMES[key] || titleCase(key);

function escXml(s) {
  return String(s).replace(/[<>&'"]/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
  })[c]);
}

function isPlaceholderFile(file) {
  try {
    const fd = fs.openSync(file, 'r');
    const buf = Buffer.alloc(512);
    const bytes = fs.readSync(fd, buf, 0, 512, 0);
    fs.closeSync(fd);
    return IS_OURS.test(buf.toString('utf8', 0, bytes));
  } catch (_) {
    return false;
  }
}

/* ---------------------------------------------------------------- */
/* 3. Plantilla SVG                                                  */
/* ---------------------------------------------------------------- */
function wrapLines(text, maxLen, maxLines) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return ['KAVARI'];
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxLen && cur) {
      lines.push(cur);
      cur = w;
      if (lines.length >= maxLines - 1) break;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  return lines.slice(0, maxLines);
}

function svgPlaceholder({ label, section, country, kind }) {
  const lines = wrapLines(label, 24, 3);
  const multi = lines.length > 1;
  const nameFont = multi ? 42 : 52;
  let y = multi ? 268 : 300;
  let nameXml = '';
  for (const ln of lines) {
    nameXml += `<text x="400" y="${y}" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="700" font-size="${nameFont}" fill="#ffffff">${escXml(ln)}</text>\n  `;
    y += nameFont + 6;
  }
  const lastNameY = y - (nameFont + 6);
  let metaXml = '';
  if (kind !== 'header' && section) {
    metaXml += `<text x="400" y="${lastNameY + 38}" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="600" font-size="22" letter-spacing="7" fill="#9dc8ff">${escXml(section)}</text>\n  `;
    metaXml += `<text x="400" y="${lastNameY + 84}" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="600" font-size="28" fill="#00c2a8">${escXml(country)}</text>\n  `;
  } else if (kind === 'header') {
    metaXml += `<text x="400" y="${lastNameY + 44}" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="600" font-size="30" letter-spacing="6" fill="#00c2a8">${escXml(country)}</text>\n  `;
  }

  return `${MARKER}
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#163b80"/>
      <stop offset="1" stop-color="#0d1f3c"/>
    </linearGradient>
    <radialGradient id="r" cx="0.5" cy="0.35" r="0.75">
      <stop offset="0" stop-color="#00c2a8" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#00c2a8" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <rect width="800" height="600" fill="url(#r)"/>
  <circle cx="110" cy="110" r="170" fill="none" stroke="#ffffff" stroke-opacity="0.07" stroke-width="2"/>
  <circle cx="700" cy="500" r="210" fill="none" stroke="#00c2a8" stroke-opacity="0.14" stroke-width="2"/>
  <circle cx="400" cy="215" r="82" fill="none" stroke="#ffffff" stroke-opacity="0.16" stroke-width="2"/>
  <text x="400" y="230" text-anchor="middle" font-family="Arial, sans-serif" font-size="64" fill="#ffffff" fill-opacity="0.92">&#9992;</text>
  ${nameXml}
  ${metaXml}
  <text x="400" y="556" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="600" font-size="22" letter-spacing="12" fill="#ffffff" fill-opacity="0.5">KAVARI</text>
</svg>
`;
}

/* ---------------------------------------------------------------- */
/* 4. Recorrido de data.json                                         */
/* ---------------------------------------------------------------- */
function main() {
  const translations = loadEsTranslations();
  console.log(`Traducciones ES cargadas: ${translations.size}`);

  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  const hasBom = raw.charCodeAt(0) === 0xFEFF;
  let text = hasBom ? raw.slice(1) : raw;
  const data = JSON.parse(text);

  let created = 0;
  let skipped = 0;
  let rewritten = 0;
  let revived = 0;

  function resolveLabel(node) {
    if (node && typeof node.nombre === 'string') {
      const t = translations.get(node.nombre);
      if (t) return t;
    }
    if (node && typeof node.id === 'string' && node.id) {
      return titleCase(node.id);
    }
    return '';
  }

  /** Reemplazo de texto exacto (preserva el formato de data.json). */
  function rewritePathInData(oldPath, newPath) {
    const needle = '"' + oldPath + '"';
    const replacement = '"' + newPath + '"';
    if (text.includes(needle)) {
      text = text.split(needle).join(replacement);
      rewritten++;
    }
  }

  /**
   * Si data.json apunta a un .svg placeholder pero existe una foto real
   * con el mismo nombre base (ej. quito.jpg), la prefiere y revierte.
   */
  function findRealSibling(val) {
    if (!val.endsWith('.svg')) return null;
    const targetPath = path.join(ROOT, val.replace(/\//g, path.sep));
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) return null;
    const base = path.basename(val, '.svg').toLowerCase();
    for (const f of fs.readdirSync(dir)) {
      const ext = path.extname(f).toLowerCase();
      if (ext === '.svg') continue;
      if (path.basename(f, ext).toLowerCase() !== base) continue;
      const fp = path.join(dir, f);
      if (isPlaceholderFile(fp)) continue;
      return 'img/' + path.relative(path.join(ROOT, 'img'), fp).split(path.sep).join('/');
    }
    return null;
  }

  function walk(obj, ctry, cname, sec) {
    if (Array.isArray(obj)) {
      for (const item of obj) walk(item, ctry, cname, sec);
      return;
    }
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === 'string' && val.startsWith('img/')) {
        const kind = /(hero_img|page_header_img|header_img)$/.test(key) ? 'header' : 'card';
        let label = resolveLabel(obj);
        if (kind === 'header' || !label) label = label || cname;
        const svg = svgPlaceholder({
          label,
          section: sec ? SECTION_LABELS[sec] : '',
          country: cname,
          kind,
        });
        const newPath = val.slice(0, -path.extname(val).length) + '.svg';
        const target = path.join(ROOT, newPath.replace(/\//g, path.sep));
        const exists = fs.existsSync(target);

        // ¿Apareció una foto real con el mismo nombre? → revertir a ella
        const realSibling = findRealSibling(val);
        if (realSibling && realSibling !== val) {
          rewritePathInData(val, realSibling);
          revived++;
          continue;
        }

        // Una imagen real existente (sin marcador) siempre se respeta
        const origTarget = path.join(ROOT, val.replace(/\//g, path.sep));
        const origIsOurs = fs.existsSync(origTarget) && isPlaceholderFile(origTarget);
        if (fs.existsSync(origTarget) && !origIsOurs) {
          skipped++;
          continue;
        }

        if (!exists || isPlaceholderFile(target)) {
          fs.mkdirSync(path.dirname(target), { recursive: true });
          fs.writeFileSync(target, svg, 'utf8');
          created++;
          if (newPath !== val) rewritePathInData(val, newPath);
        } else {
          skipped++;
        }
        continue;
      }
      const nextSec = SECTION_LABELS[key] !== undefined ? key : sec;
      walk(val, ctry, cname, nextSec);
    }
  }

  for (const key of Object.keys(data)) {
    if (key === 'top10' || key === 'paquetes') continue;
    const ctryObj = data[key];
    const translated = ctryObj && typeof ctryObj.nombre === 'string'
      ? translations.get(ctryObj.nombre)
      : null;
    const cname = translated || countryLabel(key);
    walk(ctryObj, key, cname, '');
  }

  // Limpieza recursiva: eliminar placeholders sobrantes
  //  - extensión incorrecta (.jpg/.webp/...) o
  //  - .svg que ya tiene una foto real al lado (huérfano tras un revival)
  let cleaned = 0;
  (function cleanDir(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const fp = path.join(dir, e.name);
      if (e.isDirectory()) {
        cleanDir(fp);
        continue;
      }
      if (!isPlaceholderFile(fp)) continue;
      const ext = path.extname(e.name).toLowerCase();
      if (ext !== '.svg') {
        fs.unlinkSync(fp);
        cleaned++;
        continue;
      }
      // .svg placeholder con foto real al lado → sobra
      const base = path.basename(e.name, '.svg').toLowerCase();
      let hasReal = false;
      for (const g of fs.readdirSync(dir)) {
        if (g === e.name || path.extname(g).toLowerCase() === '.svg') continue;
        if (path.basename(g, path.extname(g)).toLowerCase() === base && !isPlaceholderFile(path.join(dir, g))) {
          hasReal = true;
          break;
        }
      }
      if (hasReal) {
        fs.unlinkSync(fp);
        cleaned++;
      }
    }
  })(path.join(ROOT, 'img'));

  const changed = hasBom || rewritten > 0;
  if (changed) {
    fs.writeFileSync(DATA_FILE, text, 'utf8');
    console.log(`✔ data/data.json actualizado (${rewritten} rutas → .svg${revived ? `, ${revived} revertidas a foto real` : ''}${hasBom ? ', BOM eliminado' : ''})`);
  }

  console.log(`✔ Placeholders SVG creados: ${created}`);
  console.log(`✔ Imágenes reales respetadas: ${skipped}`);
  console.log(`✔ Placeholders sobrantes eliminados: ${cleaned}`);
}

try {
  main();
} catch (e) {
  console.error('✖ Error:', e.message);
  process.exit(1);
}
