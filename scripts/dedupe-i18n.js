// DEDUPE I18N: elimina claves duplicadas dentro de cada bloque de idioma,
// conservando SIEMPRE la mejor traducción (la distinta al fallback es/en;
// si todas coinciden con el fallback, conserva la última posición).
const fs = require('fs');
const path = require('path');

/* ── Stubs navegador para obtener valores es/en de referencia ── */
const store = {};
global.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
global.navigator = { language: 'es' };
global.window = global;
window.dispatchEvent = () => {};
global.CustomEvent = class { constructor(n) { this.type = n; } };
global.location = { hostname: 'localhost', pathname: '/index.html' };
function fakeEl() {
  return { style: {}, classList: { add() {}, remove() {}, toggle() {} }, setAttribute() {}, getAttribute: () => null,
    addEventListener() {}, appendChild() {}, removeChild() {}, remove() {}, focus() {},
    querySelectorAll: () => [], querySelector: () => null, dataset: {}, innerHTML: '', textContent: '' };
}
global.document = { readyState: 'complete', addEventListener() {}, removeEventListener() {},
  querySelectorAll: () => [], querySelector: () => null, getElementById: () => null,
  createElement: () => fakeEl(), body: fakeEl(), head: fakeEl(), documentElement: fakeEl(), dispatchEvent() {} };
window.matchMedia = () => ({ matches: false });

eval(fs.readFileSync(path.join(__dirname, '..', 'js', 'idioma.js'), 'utf8'));
const used = JSON.parse(fs.readFileSync(path.join(__dirname, 'claves-i18n.json'), 'utf8')).map(x => x[0]);
function snap(l) { window.setIdioma(l); const m = {}; for (const k of used) m[k] = window.t(k); return m; }
const ESREF = snap('es'), ENREF = snap('en');

const LINE_RE = /^(\s+)([A-Za-z0-9_]+)(\s*:\s*)(['"`])([\s\S]*?)\4(,?)\s*$/;

function dedupeBlock(text, etiqueta) {
  const lines = text.split('\n');
  // Recolectar ocurrencias por clave
  const occ = new Map(); // key -> [{idx, value}]
  lines.forEach((ln, i) => {
    const m = ln.match(LINE_RE);
    if (!m) return;
    const k = m[2];
    if (!occ.has(k)) occ.set(k, []);
    occ.get(k).push({ idx: i, value: m[5], quote: m[4] });
  });

  let eliminadas = 0, actualizadas = 0;
  for (const [k, list] of occ) {
    if (list.length < 2) continue;
    // Elegir mejor valor: primero distinto de los fallbacks es/en, escaneando desde el final
    const esv = ESREF[k], env = ENREF[k];
    let best = list[list.length - 1];
    for (let i = list.length - 1; i >= 0; i--) {
      const v = list[i].value;
      if (esv !== undefined && v !== esv && (env === undefined || v !== env)) { best = list[i]; break; }
      best = list[i]; // último por defecto
    }
    // Eliminar todas menos best.idx; actualizar el valor de best si no es el elegido
    for (const o of list) {
      if (o.idx === best.idx) continue;
      lines[o.idx] = null; // marcar para borrar
      eliminadas++;
    }
    if (lines[best.idx] && best.value !== undefined) {
      const m = lines[best.idx].match(LINE_RE);
      if (m && m[5] !== best.value) {
        lines[best.idx] = `${m[1]}${m[2]}${m[3]}${m[4]}${best.value}${m[4]}${m[6]}`;
        actualizadas++;
      }
    }
  }
  const out = lines.filter(l => l !== null).join('\n');
  console.log(`${etiqueta}: duplicadas eliminadas=${eliminadas}, valores actualizados=${actualizadas}`);
  return out;
}

/* idioma.js: dos bloques (es y en) */
const f1 = path.join(__dirname, '..', 'js', 'idioma.js');
let s1 = fs.readFileSync(f1, 'utf8');
const crlf1 = s1.includes('\r\n');
if (crlf1) s1 = s1.replace(/\r\n/g, '\n');
const esStart = s1.indexOf('es: {');
const enStart = s1.indexOf('\n    en: {') >= 0 ? s1.indexOf('\n    en: {') : s1.indexOf('en: {');
const enEndMark = s1.indexOf('// carga desde js/idioma-pt.js');
const enEnd = enEndMark > 0 ? s1.lastIndexOf('}', enEndMark) : s1.length;
const pre = s1.slice(0, esStart);
const post = s1.slice(enEnd);
const newEs = dedupeBlock(s1.slice(esStart, enStart), 'ES');
const newEn = dedupeBlock(s1.slice(enStart, enEnd), 'EN');
s1 = pre + newEs + newEn + post;
if (crlf1) s1 = s1.replace(/\n/g, '\r\n');
fs.writeFileSync(f1, s1, 'utf8');

/* pt y fr: archivo completo */
for (const [f, tag] of [['js/idioma-pt.js', 'PT'], ['js/idioma-fr.js', 'FR']]) {
  const fp = path.join(__dirname, '..', f);
  let s = fs.readFileSync(fp, 'utf8');
  const crlf = s.includes('\r\n');
  if (crlf) s = s.replace(/\r\n/g, '\n');
  // solo dentro del objeto (desde "= {" hasta el "};")
  const ini = s.indexOf('{');
  const fin = s.lastIndexOf('};');
  const cuerpo = s.slice(ini + 1, fin);
  s = s.slice(0, ini + 1) + dedupeBlock(cuerpo, tag) + s.slice(fin);
  if (crlf) s = s.replace(/\n/g, '\r\n');
  fs.writeFileSync(fp, s, 'utf8');
}
console.log('DEDUPE COMPLETO');
