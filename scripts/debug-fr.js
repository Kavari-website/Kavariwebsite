const fs = require('fs');
const s = fs.readFileSync('js/idioma-fr.js', 'utf8');
console.log('contiene substring:', s.includes('paisBolivia_practica_infoCards_0_titulo'));
const i = s.indexOf('_infoCards_');
console.log('primer _infoCards_ pos:', i);
if (i > 0) console.log(JSON.stringify(s.slice(i - 60, i + 60)));
const re = /^\s+([A-Za-z0-9_]+)\s*:\s*(['"])([\s\S]*?)\2\s*,?\s*$/gm;
console.log('pares extraidos FR:', [...s.matchAll(re)].length);
const e = fs.readFileSync('js/idioma.js', 'utf8');
const enStart = e.indexOf('\n    en: {') >= 0 ? e.indexOf('\n    en: {') : e.indexOf('en: {');
const esBlock = e.slice(e.indexOf('es: {'), enStart);
console.log('pares extraidos ES:', [...esBlock.matchAll(re)].length);
// ¿cuántas líneas infoCards hay en cada uno?
console.log('infoCards líneas ES:', (esBlock.match(/infoCards_\d_titulo/gm) || []).length);
console.log('infoCards líneas FR:', (s.match(/infoCards_\d_titulo/gm) || []).length);
