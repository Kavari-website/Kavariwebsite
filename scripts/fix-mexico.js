const fs = require('fs');
let b = fs.readFileSync('scripts/fr-parts/mexico-b.json', 'utf8');
b = b.replace(/_descriptions"/g, '_descripcion"');
b = b.replace('oaxaquègne', 'oaxaquèque');
fs.writeFileSync('scripts/fr-parts/mexico-b.json', b, 'utf8');
JSON.parse(b);
JSON.parse(fs.readFileSync('scripts/fr-parts/mexico-a.json', 'utf8'));
console.log('México JSON OK');
