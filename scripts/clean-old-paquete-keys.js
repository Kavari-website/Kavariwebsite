// Limpia las claves huérfanas de los paquetes eliminados
// (Francia, China, India, Italia) de los diccionarios de idiomas.
const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, '..', 'js', 'idioma.js'),
  path.join(__dirname, '..', 'js', 'idioma-pt.js')
];

const RE = /^[ \t]*paquete(?:Francia|China|India|Italia)(?:Titulo|Desc):.*$,?\r?\n/gm;

for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const matches = src.match(/^[\t ]*paquete(?:Francia|China|India|Italia)(?:Titulo|Desc):.*$[\r\n]{0,2}/gm) || [];
  const cleaned = src.replace(/^[\t ]*paquete(?:Francia|China|India|Italia)(?:Titulo|Desc):.*$[\r\n]{0,2}/gm, '');
  fs.writeFileSync(f, cleaned, 'utf8');
  console.log(path.basename(f) + ': claves eliminadas =', matches.length);
}
console.log('LIMPIEZA OK');
