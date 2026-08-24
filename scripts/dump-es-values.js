// Muestra el valor ES de claves específicas para traducirlas al EN.
const fs = require('fs');
const es = fs.readFileSync('js/idioma.js', 'utf8');
const keys = ['footerNewsTitle', 'tutorial', 'contactoSuperate', 'navSouvenirs',
  'paisesContinenteAsia', 'contactoInstagram', 'contactoPromocionVal',
  'planCtaTelefonoPH', 'planCtaViajerosPH', 'planCtaPresupuestoBajo',
  'planCtaPresupuestoMedio', 'planCtaPresupuestoAlto', 'planCtaPresupuestoPremium',
  'perfilFavoritosSortManual', 'planPremiumNombre'];
for (const k of keys) {
  const re = new RegExp('\\b' + k + '\\s*:\\s*([\'"])([\\s\\S]*?)\\1', 'm');
  const m = re.exec(es);
  console.log(k, '=', m ? m[2] : '(NO ENCONTRADO)');
}
