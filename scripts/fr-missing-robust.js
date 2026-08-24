// Extractor ROBUSTO: parsea línea por línea sin depender de indentación.
const fs = require('fs');
const path = require('path');

function pairsOfBlock(text) {
  const map = {};
  const re = /^[ \t]*([A-Za-z0-9_]+)\s*:\s*(['"])([\s\S]*?)\2\s*,?\s*$/gm;
  for (const m of text.matchAll(re)) map[m[1]] = m[3];
  return { map, n: Object.keys(map).length };
}

const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'idioma.js'), 'utf8').replace(/\r\n/g, '\n');
const frText = fs.readFileSync(path.join(__dirname, '..', 'js', 'idioma-fr.js'), 'utf8').replace(/\r\n/g, '\n');

const esStart = src.indexOf('es: {');
const enStart = src.search(/\n\s*en\s*:\s*\{/);
if (enStart < 0) throw new Error('marcador en: { no encontrado');
const esBlock = src.slice(src.indexOf('\n', esStart), enStart);
const frStart = frText.indexOf('{');
const frEnd = frText.lastIndexOf('};');
const frBlock = frText.slice(frText.indexOf('\n', frStart), frEnd);

const ES = pairsOfBlock(esBlock);
const FR = pairsOfBlock(frBlock);
console.log('ES claves:', ES.n, '| FR claves:', FR.n);

const faltan = Object.keys(ES.map).filter(k => FR.map[k] === undefined);
console.log('FR FALTAN:', faltan.length);

/* Agrupado */
const grupos = {};
for (const k of faltan) {
  const m = k.match(/^pais([A-Za-z]+?)_/);
  const g = m ? 'pais:' + m[1] : 'core';
  grupos[g] = (grupos[g] || 0) + 1;
}
Object.entries(grupos).sort((a, b) => b[1] - a[1]).forEach(([g, n]) => console.log(' ', g.padEnd(26), n));

/* Guardar lista completa para trabajar */
fs.writeFileSync(path.join(__dirname, 'fr-faltantes-real.json'),
  JSON.stringify(faltan.map(k => ({ k, es: ES.map[k] })), null, 0));
console.log('Guardado: scripts/fr-faltantes-real.json');
