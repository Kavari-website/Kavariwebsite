// Agrega las últimas 13 claves FR con valores propios.
const fs = require('fs');
const f = 'js/idioma-fr.js';
let s = fs.readFileSync(f, 'utf8');

const add = [
  "  contactoInstagram: 'Instagram',",
  "  contactoPromocionVal: 'Supérate Promo 2027',",
  "  planCtaTelefonoPH: '+507 6000-0000',",
  "  planCtaViajerosPH: '2',",
  "  planCtaPresupuestoBajo: '500 $ – 1 000 $',",
  "  planCtaPresupuestoMedio: '1 000 $ – 2 500 $',",
  "  planCtaPresupuestoAlto: '2 500 $ – 5 000 $',",
  "  planCtaPresupuestoPremium: '5 000 $ +',",
  "  perfilFavoritosSortManual: 'Manuel',",
  "  planPremiumNombre: 'Premium',",
  "  planPremiumPrecio: '9,99 $US',",
  "  planOpNombre: 'OP',",
  "  planOpPrecio: '19,99 $US'"
].join('\n');

const anchor = /(\n  chatSubtitleDestino: "Specialised in \{nombre\}",?\n\};)/;
if (!anchor.test(s)) { console.error('ANCLA NO ENCONTRADA'); process.exit(1); }
s = s.replace(anchor, m => m.replace(/,?\n\};/, ',\n' + add + '\n};\n'));
fs.writeFileSync(f, s, 'utf8');
console.log('13 claves FR agregadas');
