const fs = require('fs');
const f = 'scripts/fr-parts/panama-a.json';
let s = fs.readFileSync(f, 'utf8');
s = s.replace('"Fragments":', '"paisPanama_souvenirs_1_productos_4_descripcion":');
fs.writeFileSync(f, s, 'utf8');
console.log('clave corregida');
