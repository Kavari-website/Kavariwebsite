// Restaura las 2 líneas ancla borradas del bloque EN (versión limpia).
const fs = require('fs');
const f = 'js/idioma.js';
let s = fs.readFileSync(f, 'utf8');
const crlf = s.includes('\r\n');
if (crlf) s = s.replace(/\r\n/g, '\n');

let cambios = 0;

/* 1. featureDias5 EN antes de featureDias6 EN */
if (!/featureDias5:\s*'5 days/.test(s)) {
  const target = "featureDias6: '6 days / 5 nights',";
  const i = s.indexOf(target);
  if (i < 0) { console.error('no encontré featureDias6 EN'); process.exit(1); }
  const li = s.lastIndexOf('\n', i);
  const indent = s.slice(li + 1, i);
  s = s.slice(0, li + 1) + indent + "featureDias5: '5 days / 4 nights',\n" + s.slice(li + 1);
  cambios++;
}

/* 2. regionCentroamerica EN antes de regionSudamerica EN */
if (!/regionCentroamerica:\s*'Central America'/.test(s)) {
  const target = "regionSudamerica: 'South America',";
  const i = s.indexOf(target);
  if (i < 0) { console.error('no encontré regionSudamerica EN'); process.exit(1); }
  const li = s.lastIndexOf('\n', i);
  const indent = s.slice(li + 1, i);
  s = s.slice(0, li + 1) + indent + "regionCentroamerica: 'Central America',\n" + s.slice(li + 1);
  cambios++;
}

if (crlf) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(f, s, 'utf8');
console.log('restauradas:', cambios);
