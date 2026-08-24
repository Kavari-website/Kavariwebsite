const fs = require('fs');
let s = fs.readFileSync('scripts/fr-parts/panama-c.json', 'utf8');
s = s.replace('_platos_4_descriptions"', '_platos_4_descripcion"');
s = s.replace('_platos_7_descriptions"', '_platos_7_descripcion"');
s = s.replace('_platos_8_descriptions"', '_platos_8_descripcion"');
s = s.replace('_platos_9_descriptions"', '_platos_9_descripcion"');
fs.writeFileSync('scripts/fr-parts/panama-c.json', s, 'utf8');
JSON.parse(s);
console.log('Panamá C OK');
