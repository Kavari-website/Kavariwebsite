// Verificación DEFINITIVA al 100%: expone el diccionario interno y comprueba
// que CADA clave usada en el sitio tenga entrada propia en es/en/pt/fr.
const fs = require('fs');
const path = require('path');

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

let src = fs.readFileSync(path.join(__dirname, '..', 'js', 'idioma.js'), 'utf8');
eval(src);
eval(fs.readFileSync(path.join(__dirname, '..', 'js', 'idioma-pt.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '..', 'js', 'idioma-fr.js'), 'utf8'));
window.setIdioma('es'); // fuerza merge de extras

/* Extracción textual: claves propias de cada bloque */
function keysOfBlock(text) {
  const set = new Set();
  for (const m of text.matchAll(/^\s+([A-Za-z0-9_]+)\s*:/gm)) set.add(m[1]);
  return set;
}
const esStart = src.indexOf('es: {');
const enStart = src.indexOf('en: {');
const esText = src.slice(esStart, enStart);
const enText = src.slice(enStart);
const ptText = fs.readFileSync(path.join(__dirname, '..', 'js', 'idioma-pt.js'), 'utf8');
const frText = fs.readFileSync(path.join(__dirname, '..', 'js', 'idioma-fr.js'), 'utf8');

const DICT = { es: keysOfBlock(esText), en: keysOfBlock(enText), pt: keysOfBlock(ptText), fr: keysOfBlock(frText) };
const keys = JSON.parse(fs.readFileSync(path.join(__dirname, 'claves-i18n.json'), 'utf8')).map(x => x[0]);
console.log('Claves usadas:', keys.length);

for (const lang of ['es', 'en', 'pt', 'fr']) {
  const bloque = DICT[lang];
  const faltan = keys.filter(k => !bloque.has(k));
  console.log(lang.toUpperCase() + ': entrada propia para ' + (keys.length - faltan.length) + '/' + keys.length +
    (faltan.length ? ' | FALTAN (' + faltan.length + '): ' + faltan.slice(0, 40).join(', ') : ' ✅'));
}
