// Fusión final: aplica TODOS los lotes FR (por clave directa + por valor repetido).
const fs = require('fs');
const path = require('path');

const pend = JSON.parse(fs.readFileSync(path.join(__dirname, 'fr-faltantes-real.json'), 'utf8'));
const partsDir = path.join(__dirname, 'fr-parts');

/* 1. Cargar mapas por clave directa (todos menos repetidos.json) */
const directo = {};
for (const file of fs.readdirSync(partsDir).filter(f => f.endsWith('.json') && f !== 'repetidos.json')) {
  Object.assign(directo, JSON.parse(fs.readFileSync(path.join(partsDir, file), 'utf8')));
}
/* 2. Mapa por valor */
const rep = JSON.parse(fs.readFileSync(path.join(partsDir, 'repetidos.json'), 'utf8'));

let resueltas = 0, nuevas = [];
for (const { k, es } of pend) {
  let v = directo[k];
  if (v === undefined) v = rep[String(es).trim()];
  if (v !== undefined) { nuevas.push(`  ${k}: ${JSON.stringify(v)},`); resueltas++; }
}

const f = path.join(__dirname, '..', 'js', 'idioma-fr.js');
let s = fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n');
s = s.replace(/\n\};\s*$/, '\n' + nuevas.join('\n') + '\n};\n');
fs.writeFileSync(f, s, 'utf8');
console.log('Aplicadas:', resueltas);
