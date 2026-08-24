// Aplica traducciones de valores repetidos: si el valor ES de una clave
// pendiente coincide con repetidos.json, asigna su traducción FR.
const fs = require('fs');
const path = require('path');

const pend = JSON.parse(fs.readFileSync(path.join(__dirname, 'fr-faltantes-real.json'), 'utf8'));
const rep = JSON.parse(fs.readFileSync(path.join(__dirname, 'fr-parts', 'repetidos.json'), 'utf8'));

let resueltas = 0;
const nuevas = [];
for (const { k, es } of pend) {
  const v = rep[String(es).trim()];
  if (v !== undefined) {
    nuevas.push(`  ${k}: ${JSON.stringify(v)},`);
    resueltas++;
  }
}

/* Insertar en idioma-fr.js antes del cierre */
const f = path.join(__dirname, '..', 'js', 'idioma-fr.js');
let s = fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n');
s = s.replace(/\n\};\s*$/, '\n' + nuevas.join('\n') + '\n};\n');
fs.writeFileSync(f, s, 'utf8');
console.log('Resueltas con repetidos:', resueltas, '| quedan:', pend.length - resueltas);
