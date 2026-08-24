const fs = require('fs');
const raw = fs.readFileSync('js/idioma.js', 'utf8');
const norm = raw.replace(/\r\n/g, '\n');
const re = /^\s+([A-Za-z0-9_]+)\s*:\s*(['"])([\s\S]*?)\2\s*,?\s*$/gm;

function count(text) { return [...text.matchAll(re)].length; }

console.log('RAW len:', raw.length, '| NORM len:', norm.length);
for (const [name, txt] of [['RAW', raw], ['NORM', norm]]) {
  const esA = txt.indexOf('es: {');
  const enB1 = txt.indexOf('\n    en: {');
  const enB2 = txt.indexOf('en: {');
  console.log(`[${name}] es:{ @${esA} | \\n+4sp en:{ @${enB1} | en:{ @${enB2}}`);
  const slice = txt.slice(esA, enB1 >= 0 ? enB1 : enB2);
  console.log(`   slice len=${slice.length} pares=${count(slice)} lineas=${slice.split('\n').length}`);
}
