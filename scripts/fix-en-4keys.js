// Agrega las 4 claves faltantes al bloque EN de idioma.js.
const fs = require('fs');
const f = 'js/idioma.js';
let s = fs.readFileSync(f, 'utf8');
const crlf = s.includes('\r\n');
if (crlf) s = s.replace(/\r\n/g, '\n');

/* ancla dentro del bloque EN (valores en inglés) */
const anchorRe = /(\n\s*featureDias5:\s*'5 days \/ 4 nights',)/;
if (!anchorRe.test(s)) { console.error('ancla EN no encontrada'); process.exit(1); }
s = s.replace(anchorRe, (m) => m[1] +
  "\n            featureDias6: '6 days / 5 nights',");

const anchor2Re = /(\n\s*regionCentroamerica:\s*'Central America',)/;
if (!anchor2Re.test(s)) { console.error('ancla regiones EN no encontrada'); process.exit(1); }
s = s.replace(anchor2Re, (m) => m[1] +
  "\n            regionSudamerica: 'South America'," +
  "\n            regionCaribe: 'Caribbean'," +
  "\n            regionNorteamerica: 'North America',");

if (crlf) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(f, s, 'utf8');
console.log('EN: 4 claves agregadas');
