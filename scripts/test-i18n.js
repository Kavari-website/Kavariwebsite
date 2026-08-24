// Prueba funcional del sistema i18n de KAVARI en Node:
// carga idioma.js + extras (pt/fr) con stubs del navegador y compara
// las 425 claves REALES usadas en el sitio bajo es/en/pt/fr.
const fs = require('fs');
const path = require('path');

/* ── Stubs mínimos del navegador ── */
const store = {};
global.localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; }
};
global.navigator = { language: 'es' };
global.window = global;
window.dispatchEvent = () => {};
global.CustomEvent = class { constructor(n, o) { this.type = n; Object.assign(this, o); } };
global.location = { hostname: 'localhost', pathname: '/index.html' };
function fakeEl() {
  return {
    style: {}, classList: { add() {}, remove() {}, toggle() {} },
    setAttribute() {}, getAttribute: () => null, addEventListener() {},
    appendChild() {}, removeChild() {}, remove() {}, focus() {},
    querySelectorAll: () => [], querySelector: () => null,
    dataset: {}, innerHTML: '', textContent: ''
  };
}
global.document = {
  readyState: 'complete',
  addEventListener() {}, removeEventListener() {},
  querySelectorAll: () => [], querySelector: () => null, getElementById: () => null,
  createElement: () => fakeEl(), body: fakeEl(), head: fakeEl(),
  documentElement: fakeEl(), dispatchEvent() {}
};
window.matchMedia = () => ({ matches: false });

/* ── Cargar diccionarios reales ── */
eval(fs.readFileSync(path.join(__dirname, '..', 'js', 'idioma.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '..', 'js', 'idioma-pt.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '..', 'js', 'idioma-fr.js'), 'utf8'));

if (typeof window.t !== 'function') { console.error('window.t no disponible'); process.exit(1); }

const keys = JSON.parse(fs.readFileSync(path.join(__dirname, 'claves-i18n.json'), 'utf8')).map(x => x[0]);
console.log('Claves reales usadas en el sitio:', keys.length);

function snapshot(lang) {
  window.setIdioma(lang);
  const m = {};
  for (const k of keys) m[k] = window.t(k);
  return m;
}

const es = snapshot('es');
const en = snapshot('en');
const pt = snapshot('pt');
const fr = snapshot('fr');

function gaps(map, base) {
  // cae al fallback si el valor devuelto ES la clave o ES idéntico al español
  return keys.filter(k => map[k] === k || map[k] === base[k]);
}
const enFaltan = gaps(en, es);
const ptFaltan = gaps(pt, es);
const frFaltan = gaps(fr, es);

console.log('\n=== INGLÉS ===');
console.log('Cobertura EN:', (100 - (enFaltan.length / keys.length * 100)).toFixed(1) + '%',
  '| claves sin traducción propia:', enFaltan.length);
if (enFaltan.length) {
  console.log('LISTA COMPLETA EN→ES:');
  for (const k of enFaltan) console.log('  -', k, '=', JSON.stringify(es[k]));
}

console.log('\n=== PORTUGUÉS ===');
console.log('Cobertura PT:', (100 - (ptFaltan.length / keys.length * 100)).toFixed(1) + '%',
  '| sin traducción propia:', ptFaltan.length);

console.log('\n=== FRANCÉS (fase 1, se esperaba parcial) ===');
console.log('Cobertura FR:', (100 - (frFaltan.length / keys.length * 100)).toFixed(1) + '%');

/* ── UTF-8 ── */
let bad = 0;
for (const f of ['idioma.js', 'idioma-pt.js', 'idioma-fr.js']) {
  const s = fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8');
  const n = (s.match(/\uFFFD/g) || []).length;
  const moji = (s.match(/Ã[©±³­¡º]|Â°/g) || []).length;
  if (n || moji) { console.log('UTF-8 PROBLEMA en ' + f, n, moji); bad++; }
}
console.log(bad ? '' : '\nUTF-8 OK en los 3 diccionarios');
