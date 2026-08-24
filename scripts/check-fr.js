const fs = require('fs');
// 1. Claves del FR que NO existen en ES/EN (posibles typos de mi parte)
const es = fs.readFileSync('js/idioma.js', 'utf8');
const fr = fs.readFileSync('js/idioma-fr.js', 'utf8');
const frKeys = [...fr.matchAll(/^\s{2}([A-Za-z0-9_]+):/gm)].map(m => m[1]);
let faltan = 0;
for (const k of frKeys) {
  const re = new RegExp('\\b' + k + '\\s*:');
  if (!re.test(es)) { console.log('CLAVE DUDOSA en fr:', k); faltan++; }
}
console.log('Claves FR:', frKeys.length, '| dudosas:', faltan);
// 2. UTF-8
const bad = (fr.match(/\uFFFD/g) || []).length;
console.log(bad ? 'UTF-8 PROBLEMA: ' + bad : 'UTF-8 OK (acentos franceses intactos)');
console.log('muestra:', /navInicio: '([^']+)'/.exec(fr)[1], '|', /paisesSub: '([^']+)'/.exec(fr)[1]);
