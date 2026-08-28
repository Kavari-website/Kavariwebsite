const fs = require('fs');
const code = fs.readFileSync('_frag1.js','utf8');
const GAPS = eval('(function(){' + code.replace('const GAPS', 'var GAPS') + '; return GAPS;})()');
const gapsJson = JSON.parse(fs.readFileSync('gaps-fr.json','utf8'));
const fr = fs.readFileSync('../js/idioma-fr.js','utf8');

// 1) valid JS? assign to fake window
const fake = {};
const wrapped = fr.replace(/window\.__kavariIdiomasExtras/g, 'fake.__kavariIdiomasExtras');
try { eval(wrapped); } catch (e) { console.log('SYNTAX ERROR:', e.message); process.exit(1); }
const obj = fake.__kavariIdiomasExtras.fr;
const keys = Object.keys(obj);
console.log('total fr keys:', keys.length);

// 2) no gaps key still english
const eng = new Map(gapsJson.map(g => [g.key, g.actual]));
let bad = [];
for (const k of Object.keys(GAPS)) {
  if (obj[k] === eng.get(k)) bad.push(k);
}
console.log('gaps keys still english:', bad.length, bad);

// 3) every gaps key present
let missingGaps = Object.keys(GAPS).filter(k => !(k in obj));
console.log('gaps keys missing from fr:', missingGaps.length, missingGaps);

// 4) reals coverage
const real = JSON.parse(fs.readFileSync('fr-faltantes-real.json','utf8'));
let missingReal = real.filter(r => !(r.k in obj));
console.log('real keys still missing from fr:', missingReal.length);
