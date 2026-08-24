// Lista TODAS las claves del bloque ES que no tienen entrada propia en FR,
// agrupadas por sección, con su texto fuente (es) para traducir.
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'idioma.js'), 'utf8').replace(/\r\n/g, '\n');
const frText = fs.readFileSync(path.join(__dirname, '..', 'js', 'idioma-fr.js'), 'utf8').replace(/\r\n/g, '\n');

function pairsOf(text) {
  const map = {};
  for (const m of text.matchAll(/^\s+([A-Za-z0-9_]+)\s*:\s*(['"`])([\s\S]*?)\2\s*,?\s*$/gm)) {
    map[m[1]] = m[3];
  }
  return map;
}
const enStart = src.indexOf('\n    en: {') >= 0 ? src.indexOf('\n    en: {') : src.indexOf('en: {');
const ES = pairsOf(src.slice(src.indexOf('es: {'), enStart));
const frKeys = new Set([...frText.matchAll(/^\s+([A-Za-z0-9_]+)\s*:/gm)].map(m => m[1]));

const faltan = Object.keys(ES).filter(k => !frKeys.has(k));
console.log('Claves ES totales:', Object.keys(ES).length);
console.log('FR ya tiene:', frKeys.size);
console.log('FR le faltan:', faltan.length);

// Agrupar por prefijo
const grupos = {};
for (const k of faltan) {
  let g = 'core';
  const m = k.match(/^pais([A-Za-z]+?)_/);
  if (m) g = 'pais:' + m[1];
  else if (/^(top|paquete|plan|about|faq|ayuda|perfil|cuenta|contacto|footer|nav|hero|search)/.test(k)) g = k.replace(/_.*$/, '');
  grupos[g] = (grupos[g] || 0) + 1;
}
console.log('\n=== GRUPOS ===');
Object.entries(grupos).sort((a, b) => b[1] - a[1]).forEach(([g, n]) => console.log(g.padEnd(24), n));

/* Guardar referencia completa para traducir */
fs.writeFileSync(path.join(__dirname, 'fr-faltantes.json'),
  JSON.stringify(faltan.map(k => ({ k, es: ES[k] })), null, 1));
console.log('\nReferencia guardada en scripts/fr-faltantes.json');
