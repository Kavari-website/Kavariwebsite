// Extrae todas las claves data-i18n de las páginas y claves t('...')
// usadas en los JS principales, ordenadas por frecuencia.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const pages = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
const counter = {};

function add(k) {
  if (!k) return;
  counter[k] = (counter[k] || 0) + 1;
}

for (const p of pages) {
  const s = fs.readFileSync(path.join(ROOT, p), 'utf8');
  for (const m of s.matchAll(/data-i18n(?:-placeholder|-title)?="([^"]+)"/g)) add(m[1]);
}

const jsFiles = ['index.js', 'destino.js', 'paises.js', 'perfil.js', 'contacto.js', 'contact-form.js',
  'account.js', 'ayuda.js', 'sobrenosotros.js', 'package-request.js', 'traveler-registration.js',
  'guide-registration.js', 'chatbot-widget.js', 'footer.js', 'mobile-nav.js'];
for (const j of jsFiles) {
  const f = path.join(ROOT, 'js', j);
  if (!fs.existsSync(f)) continue;
  const s = fs.readFileSync(f, 'utf8');
  for (const m of s.matchAll(/\bt\(\s*'([^']+)'/g)) add(m[1]);
  for (const m of s.matchAll(/_t\(\s*'([^']+)'/g)) add(m[1]);
}

const list = Object.entries(counter).sort((a, b) => b[1] - a[1]);
console.log('TOTAL claves únicas:', list.length);
console.log('=== LAS 120 MÁS USADAS ===');
console.log(list.slice(0, 120).map(([k, n]) => k + ' (' + n + ')').join('\n'));
fs.writeFileSync(path.join(__dirname, 'claves-i18n.json'), JSON.stringify(list), 'utf8');
console.log('Guardado completo en scripts/claves-i18n.json');
