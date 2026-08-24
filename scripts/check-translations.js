const fs = require('fs');
const es = fs.readFileSync('js/idioma.js', 'utf8');
const pt = fs.readFileSync('js/idioma-pt.js', 'utf8');

const enAnchor = es.indexOf("paqueteElSalvadorDesc: 'Discover El Salvador");
const enPart = enAnchor > 0 ? es.slice(enAnchor, enAnchor + 3000) : '';
function grab(src, key) {
  const m = new RegExp(key + ": '([^']+)'").exec(src);
  return m ? m[1] : '(NO ENCONTRADO)';
}
console.log('EN Peru      :', grab(enPart, 'paquetePeruTitulo'));
console.log('EN RD        :', grab(enPart, 'paqueteRepublicaDominicanaTitulo'));
console.log('EN CostaRica :', grab(enPart, 'paqueteCostaRicaTitulo'));
console.log('PT Colombia  :', grab(pt, 'paqueteColombiaTitulo'));
console.log('PT region Sud:', grab(pt, 'regionSudamerica'));
console.log('PT Guyana    :', grab(pt, 'paqueteGuyanaTitulo'));

const count = s => (s.match(/paquete[A-Za-z]+Titulo/g) || []).length;
console.log('Total claves Titulo -> idioma.js:', count(es), '| idioma-pt.js:', count(pt));
