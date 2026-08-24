// Agrega la coma faltante antes del bloque insertado.
const fs = require('fs');
const f = 'js/idioma-fr.js';
let s = fs.readFileSync(f, 'utf8');
const bad = "planOpPrecio: '19,99 $US'\n  guias:";
if (s.includes(bad)) {
  s = s.replace(bad, () => "planOpPrecio: '19,99 $US',\n  guias:");
  fs.writeFileSync(f, s, 'utf8');
  console.log('coma agregada');
} else {
  const i = s.indexOf('planOpPrecio');
  console.log('patrón no encontrado. Contexto:', JSON.stringify(s.slice(i, i + 70)));
}
