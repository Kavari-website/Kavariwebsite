// Fusiona todos los lotes FR en idioma-fr.js (sin duplicar claves existentes).
const fs = require('fs');
const path = require('path');

const partsDir = path.join(__dirname, 'fr-parts');
const files = ['core-a.json', 'core-b.json', 'core-c.json', 'core-d.json',
  'tut-a.json', 'tut-b.json', 'tut-c.json', 'tut-d.json', 'tut-e.json', 'tut-f.json', 'tut-g.json',
  'paises.json'];

const f = path.join(__dirname, '..', 'js', 'idioma-fr.js');
let s = fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n');

const yaTiene = new Set([...s.matchAll(/^\s+([A-Za-z0-9_]+)\s*:/gm)].map(m => m[1]));
let nuevas = [], omitidas = 0;
for (const file of files) {
  const p = path.join(partsDir, file);
  if (!fs.existsSync(p)) { console.log('falta parte:', file); continue; }
  const map = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const [k, v] of Object.entries(map)) {
    if (yaTiene.has(k)) { omitidas++; continue; }
    yaTiene.add(k);
    nuevas.push(`  ${k}: ${JSON.stringify(v)},`);
  }
}

if (!nuevas.length) { console.log('Nada que agregar'); process.exit(0); }

/* Insertar antes del cierre final */
s = s.replace(/\n\};\s*$/, '\n' + nuevas.join('\n') + '\n};\n');
fs.writeFileSync(f, s, 'utf8');
console.log('Claves agregadas al diccionario FR:', nuevas.length, '| ya existían (omitidas):', omitidas);
