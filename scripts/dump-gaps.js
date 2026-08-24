// Exporta los huecos reales de PT y FR para traducirlos al 100%.
// PT: claves cuyo valor cae al español. FR: claves que aún están en inglés o español.
const fs = require('fs');
const path = require('path');

/* ── Stubs del navegador (igual que test-i18n) ── */
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

const keys = JSON.parse(fs.readFileSync(path.join(__dirname, 'claves-i18n.json'), 'utf8')).map(x => x[0]);
function snap(lang) { window.setIdioma(lang); const m = {}; for (const k of keys) m[k] = window.t(k); return m; }
const es = snap('es'), en = snap('en'), pt = snap('pt'), fr = snap('fr');

const ptGaps = keys.filter(k => pt[k] === k || pt[k] === es[k])
  .map(k => ({ key: k, es: es[k], en: en[k], actual: pt[k] }));
let frGaps = keys.filter(k => {
  const mismoEnEs = en[k] === es[k];
  if (fr[k] === k) return true;
  if (!mismoEnEs && fr[k] === en[k]) return true;
  return false;
}).map(k => ({ key: k, es: es[k], en: en[k], actual: fr[k] }));

fs.writeFileSync(path.join(__dirname, 'gaps-pt.json'), JSON.stringify(ptGaps, null, 1));
fs.writeFileSync(path.join(__dirname, 'gaps-fr.json'), JSON.stringify(frGaps, null, 1));
console.log('Huecos PT:', ptGaps.length, '| Huecos FR:', frGaps.length);
