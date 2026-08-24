// Correcciones finales de auditoría:
// - Stale "36" -> 21 donde aplica (no toca datos reales como Bolivia 36 lenguas)
// - faq10a EN con Oxford comma + FR traducido de verdad
// - planViajeroF1 pt -> 21 destinos
const fs = require('fs');
const path = require('path');

function patch(file, pairs) {
  let s = fs.readFileSync(file, 'utf8');
  const crlf = s.includes('\r\n');
  if (crlf) s = s.replace(/\r\n/g, '\n');
  let n = 0;
  for (const [from, to] of pairs) {
    if (!s.includes(from)) { console.log('NO ENCONTRADO [' + path.basename(file) + ']: ' + from.slice(0, 55)); continue; }
    s = s.replace(from, () => to);
    n++;
  }
  if (crlf) s = s.replace(/\n/g, '\r\n');
  fs.writeFileSync(file, s, 'utf8');
  console.log(path.basename(file) + ': reemplazos=' + n);
}

patch('js/idioma.js', [
  ["tutorialPaisesTitulo_0: 'Explora 36 Destinos'", "tutorialPaisesTitulo_0: 'Explora 21 Destinos'"],
  ["tutorialPaisesTitulo_0: 'Explore 36 Destinations'", "tutorialPaisesTitulo_0: 'Explore 21 Destinations'"],
  ['KAVARI está disponible en Español, Inglés, Portugués y Francés.', 'KAVARI está disponible en Español, Inglés, Portugués y Francés.']
]);

patch('js/idioma-pt.js', [
  ["entre os 36 destinos disponíveis no KAVARI", "entre os 21 destinos disponíveis no KAVARI"],
  ["tutorialPaisesTitulo_0: 'Explore 36 Destinos'", "tutorialPaisesTitulo_0: 'Explore 21 Destinos'"],
  ["verá os 36 destinos novamente", "verá os 21 destinos novamente"],
  ["planViajeroF1: '36 destinos'", "planViajeroF1: '21 destinos'"]
]);

patch('js/idioma-fr.js', [
  ['faq10a: "KAVARI is available in Spanish, English, Portuguese and French. You can change the language at any time using the language selector (🌐 icon) in the navigation bar of every page. Your preference is saved automatically for your next visit."',
   'faq10a: "KAVARI est disponible en espagnol, anglais, portugais et français. Vous pouvez changer de langue à tout moment via le sélecteur de langue (icône 🌐) présent dans la barre de navigation de toutes les pages. Votre préférence est enregistrée automatiquement pour votre prochaine visite."']
]);

// faq10a EN: variante con Oxford comma
let en = fs.readFileSync('js/idioma.js', 'utf8');
if (en.includes('Spanish, English, and Portuguese')) {
  en = en.replace(/Spanish, English, and Portuguese/g, () => 'Spanish, English, Portuguese, and French');
  fs.writeFileSync('js/idioma.js', en, 'utf8');
  console.log('idioma.js: faq10a EN corregido');
}
console.log('LISTO');
