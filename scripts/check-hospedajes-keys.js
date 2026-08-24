const fs = require('fs');
const es = fs.readFileSync('js/idioma.js', 'utf8');
const pt = fs.readFileSync('js/idioma-pt.js', 'utf8');

// Conteo de las claves nuevas por archivo (deben ser: ES 1 + EN 1 = 2 en idioma.js, 1 en pt)
for (const key of ['hospedajesZonaNota', 'zonaLabel']) {
  const n1 = (es.match(new RegExp('\\b' + key + ':', 'g')) || []).length;
  const n2 = (pt.match(new RegExp('\\b' + key + ':', 'g')) || []).length;
  console.log(key, '-> idioma.js:', n1, '| idioma-pt.js:', n2);
}
console.log('boton ES :', /reservarEstadia: '([^']+)'/.exec(es)[1]);
console.log('boton EN :', /reservarEstadia: 'See[^']+'/.exec(es)?.[1]);
console.log('boton PT :', /reservarEstadia: '([^']+)'/.exec(pt)[1]);

// Escaneo UTF-8
let bad = 0;
for (const f of ['js/idioma.js', 'js/idioma-pt.js', 'js/destino.js', 'data/data.json']) {
  const s = fs.readFileSync(f, 'utf8');
  const fffd = (s.match(/\uFFFD/g) || []).length;
  const moji = (s.match(/Ã[©±³­¡º©©]|Â°/g) || []).length;
  if (fffd || moji) { console.log('PROBLEMA', f, fffd, moji); bad++; }
}
console.log(bad ? 'PROBLEMAS: ' + bad : 'UTF-8 OK');
