// Repara las 3 líneas con $ dañadas por el patrón especial $' de replace().
const fs = require('fs');
const f = 'js/idioma-fr.js';
let s = fs.readFileSync(f, 'utf8');

const fixes = [
  ["planCtaPresupuestoBajo: '500 $ – 1 000 ,", "planCtaPresupuestoBajo: '500 $ – 1 000 $',"],
  ["planCtaPresupuestoMedio: '1 000 $ – 2 500 ,", "planCtaPresupuestoMedio: '1 000 $ – 2 500 $',"],
  ["planCtaPresupuestoAlto: '2 500 $ – 5 000 ,", "planCtaPresupuestoAlto: '2 500 $ – 5 000 $',"]
];
for (const [bad, good] of fixes) {
  if (!s.includes(bad)) { console.log('no encontrada:', bad.slice(0, 40)); continue; }
  s = s.replace(bad, () => good);
}
fs.writeFileSync(f, s, 'utf8');
console.log('reparado');
