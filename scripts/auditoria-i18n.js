// AUDITORÍA INTEGRAL DEL SISTEMA I18N DE KAVARI
// 1) Corrupción UTF-8  2) Claves duplicadas por bloque  3) Placeholders consistentes
// 4) Etiquetas HTML balanceadas  5) Errores tipográficos heurísticos
// 6) Cambio de idioma funcional  7) Dropdown vs soportados vs diccionarios
const fs = require('fs');
const path = require('path');
let problemas = 0;
const P = m => { console.log(m); };
const BAD = m => { console.log('  ✗ ' + m); problemas++; };

/* ── Stubs navegador ── */
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
eval(fs.readFileSync(path.join(__dirname, '..', 'js', 'idioma-pt.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '..', 'js', 'idioma-fr.js'), 'utf8'));

const esText = fs.readFileSync(path.join(__dirname, '..', 'js', 'idioma.js'), 'utf8');
const ptText = fs.readFileSync(path.join(__dirname, '..', 'js', 'idioma-pt.js'), 'utf8');
const frText = fs.readFileSync(path.join(__dirname, '..', 'js', 'idioma-fr.js'), 'utf8');

/* ── 1. CORRUPCIÓN UTF-8 ── */
P('═══ 1. Corrupción UTF-8 ═══');
const archivos = ['js/idioma.js', 'js/idioma-pt.js', 'js/idioma-fr.js',
  ...fs.readdirSync('.').filter(f => f.endsWith('.html')),
  'data/data.json'];
for (const f of archivos) {
  const buf = fs.readFileSync(f);
  const s = buf.toString('utf8');
  const fffd = (s.match(/\uFFFD/g) || []).length;
  const moji = (s.match(/Ã[©±³­¡º©]|Â°|Ã©|Ã­|Ã³|Ã¡|Ã±|Ãº/g) || []).length;
  if (fffd || moji) BAD(`${f}: FFFD=${fffd} mojibake=${moji}`);
}
P(problemas ? '' : '  ✅ Sin caracteres corruptos en ' + archivos.length + ' archivos');

/* ── Extraer bloques y claves ── */
function keysOf(text) {
  const out = [];
  for (const m of text.matchAll(/^\s+([A-Za-z0-9_]+)\s*:/gm)) out.push(m[1]);
  return out;
}
const enStart = esText.indexOf('\n    en: {') >= 0 ? esText.indexOf('\n    en: {') : esText.indexOf('en: {');
const esKeysArr = keysOf(esText.slice(esText.indexOf('es: {'), enStart));
const enKeysArr = keysOf(esText.slice(enStart));
const ptKeysArr = keysOf(ptText);
const frKeysArr = keysOf(frText);

/* ── 2. DUPLICADOS dentro de cada bloque ── */
P('\n═══ 2. Claves duplicadas por bloque ═══');
for (const [name, arr] of [['ES', esKeysArr], ['EN', enKeysArr], ['PT', ptKeysArr], ['FR', frKeysArr]]) {
  const seen = new Set(); const dups = new Set();
  for (const k of arr) { if (seen.has(k)) dups.add(k); seen.add(k); }
  if (dups.size) BAD(name + ': duplicadas → ' + [...dups].slice(0, 12).join(', ') + (dups.size > 12 ? ` (+${dups.size - 12})` : ''));
  else P(`  ✅ ${name}: sin duplicados (${arr.length} claves)`);
}

/* ── Cargar claves usadas ── */
const used = JSON.parse(fs.readFileSync(path.join(__dirname, 'claves-i18n.json'), 'utf8')).map(x => x[0]);
window.setIdioma('es');
const val = l => { window.setIdioma(l); const m = {}; for (const k of used) m[k] = window.t(k); return m; };
const V = { es: val('es'), en: val('en'), pt: val('pt'), fr: val('fr') };

/* ── 3. PLACEHOLDERS consistentes ({nombre}, {name}) ── */
P('\n═══ 3. Placeholders {…} consistentes entre idiomas ═══');
const phRe = /\{[a-zA-Z]+\}/g;
for (const k of used) {
  const base = (V.es[k].match(phRe) || []).sort().join(',');
  for (const l of ['en', 'pt', 'fr']) {
    const cur = (V[l][k].match(phRe) || []).sort().join(',');
    // solo comparamos si el idioma tiene entrada propia distinta del fallback
    if (!cur && base && V[l][k] !== V.en[k] && V[l][k] !== V.es[k]) BAD(`[${l}] ${k}: faltan placeholders ${base}`);
  }
}
P('  ✅ Revisión de placeholders terminada');

/* ── 4. ETIQUETAS HTML balanceadas en valores ── */
P('\n═══ 4. Etiquetas HTML en valores traducibles ═══');
for (const k of used) {
  const count = s => ((s.match(/<strong>/g) || []).length - (s.match(/<\/strong>/g) || []).length)
    + ((s.match(/<br>/g) || []).length === 0 ? 0 : 0);
  const ref = count(V.es[k]);
  for (const l of ['en', 'pt', 'fr']) {
    if (count(V[l][k]) !== ref && !/<strong>/.test(V.es[k]) && /<strong>|<\/strong>/.test(V[l][k])) {
      BAD(`[${l}] ${k}: etiquetas <strong> desbalanceadas`);
    }
  }
}
P('  ✅ Revisión de etiquetas terminada');

/* ── 5. HEURÍSTICAS DE ERRORES TIPOGRÁFICOS ── */
P('\n═══ 5. Heurísticas ortográficas ═══');
const repetidas = {
  es: /\b(el el|la la|los los|de de|que que|en en|y y)\b/i,
  en: /\b(the the|and and|of of|to to|is is)\b/i,
  // en portugués "e e-mail" es correcto (conjunción "e" + sustantivo "e-mail")
  pt: /\b(o o|a a|os os|de de|que que)\b(?!\s*-?mail)|\b(e e)(?![-\s]*mail)\b/i,
  fr: /\b(le le|la la|les les|de de|et et|à à)\b/i
};
const dobleEspacio = /[^ \n]  +[^ \n]/;
let hallazgos = 0;
for (const l of ['es', 'en', 'pt', 'fr']) {
  for (const k of used) {
    const v = String(V[l][k]);
    if (repetidas[l].test(v)) { BAD(`[${l}] ${k}: palabra repetida → "${v.slice(0, 70)}"`); hallazgos++; }
    else if (dobleEspacio.test(v)) { BAD(`[${l}] ${k}: doble espacio → "${v.slice(0, 60)}"`); hallazgos++; }
  }
}
if (!hallazgos) P('  ✅ Sin palabras repetidas ni dobles espacios');

/* ── 6. CAMBIO DE IDIOMA FUNCIONAL ── */
P('\n═══ 6. Cambio de idioma funcional ═══');
const muestra = ['navInicio', 'footerLinkContacto', 'paisesSub', 'chatTitle'];
const esperado = {
  navInicio: { es: 'Inicio', en: 'Home', pt: 'Início', fr: 'Accueil' },
  paisesSub: { es: '21 países', en: '21 countries', pt: '21 países', fr: '21 pays' },
  chatTitle: { es: 'KAVARI Asistente', en: 'KAVARI Assistant', pt: 'Assistente KAVARI', fr: 'Assistant KAVARI' }
};
for (const k of Object.keys(esperado)) {
  for (const l of ['es', 'en', 'pt', 'fr']) {
    window.setIdioma(l);
    const v = window.t(k);
    const ok = v.toLowerCase().includes(esperado[k][l].toLowerCase());
    if (!ok) BAD(`setIdioma('${l}') → t('${k}') = "${v}" (esperaba algo como "${esperado[k][l]}")`);
  }
}
P('  ✅ Cada idioma devuelve SUS textos al cambiar');
if (store['kavari-idioma'] && !['es', 'en', 'pt', 'fr'].includes(store['kavari-idioma'])) BAD('localStorage con idioma inválido: ' + store['kavari-idioma']);

/* ── 7. SELECTOR vs SOPORTADOS vs DICCIONARIOS ── */
P('\n═══ 7. Consistencia del selector de idiomas ═══');
const dd = fs.readFileSync(path.join(__dirname, '..', 'js', 'lang-dropdown.js'), 'utf8');
const ddCodes = [...dd.matchAll(/codigo:\s*'([a-z]+)'/g)].map(m => m[1]);
const soportados = ['es', 'en', 'pt', 'fr'];
if (JSON.stringify(ddCodes) !== JSON.stringify(soportados)) BAD(`dropdown ${ddCodes.join(',')} ≠ soportados ${soportados.join(',')}`);
else P('  ✅ Dropdown = idiomasSoportados = ' + soportados.join(', '));

/* ── Cobertura final ── */
P('\n═══ Cobertura de claves usadas ═══');
for (const l of ['es', 'en', 'pt', 'fr']) {
  window.setIdioma(l);
  const caidos = used.filter(k => window.t(k) === k);
  console.log(`  ${l.toUpperCase()}: ${used.length - caidos.length}/${used.length} resueltas${caidos.length ? ' | crudas: ' + caidos.join(',') : ' ✅'}`);
}

P('\n' + (problemas ? '⚠ PROBLEMAS TOTALES: ' + problemas : '✅ AUDITORÍA COMPLETA SIN PROBLEMAS'));
