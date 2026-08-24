// heroTitulo: "Descubre el mundo con KAVARI" en los 4 idiomas (con <br> del diseño).
const fs = require('fs');
function rep(f, pairs) {
  let s = fs.readFileSync(f, 'utf8');
  let n = 0;
  for (const [a, b] of pairs) {
    if (!s.includes(a)) { console.log('NO ENCONTRADO en ' + f + ': ' + a.slice(0, 50)); continue; }
    s = s.replace(a, () => b);
    n++;
  }
  fs.writeFileSync(f, s, 'utf8');
  console.log(f.split('/').pop() + ': ' + n + ' reemplazos');
}

rep('js/idioma.js', [
  ['heroTitulo: "Descubre el Mundo",', 'heroTitulo: "Descubre <br> el mundo con KAVARI",'],
  ['heroTitulo: "Discover the World",', 'heroTitulo: "Discover <br> the world with KAVARI",']
]);
rep('js/idioma-pt.js', [
  ["heroTitulo: 'Descubra <br> o mundo com KAVARI',", "heroTitulo: 'Descubra <br> o mundo com KAVARI',"]
]);
rep('js/idioma-fr.js', [
  ["heroTitulo: 'Explore le monde avec KAVARI',", "heroTitulo: 'Découvre <br> le monde avec KAVARI',"]
]);
console.log('LISTO');
