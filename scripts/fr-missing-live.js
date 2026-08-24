// Comparación EN VIVO: claves del bloque ES ausentes en el bloque FR (post-merge).
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'idioma.js'), 'utf8').replace(/\r\n/g, '\n');
const frText = fs.readFileSync(path.join(__dirname, '..', 'js', 'idioma-fr.js'), 'utf8').replace(/\r\n/g, '\n');

function pairsOf(text) {
  const map = {};
  for (const m of text.matchAll(/^\s+([A-Za-z0-9_]+)\s*:\s*(['"`])([\s\S]*?)\2\s*,?\s*$/gm)) map[m[1]] = m[3];
  return map;
}
const enStart = src.indexOf('\n    en: {') >= 0 ? src.indexOf('\n    en: {') : src.indexOf('en: {');
const ES = pairsOf(src.slice(src.indexOf('es: {'), enStart));
const FR = pairsOf(frText);

const faltan = Object.keys(ES).filter(k => FR[k] === undefined);
console.log('ES:', Object.keys(ES).length, '| FR:', Object.keys(FR).length, '| FALTAN:', faltan.length);
if (faltan.length) {
  console.log('--- LISTA COMPLETA ---');
  for (const k of faltan) console.log(k, '::', String(ES[k]).slice(0, 70));
}
