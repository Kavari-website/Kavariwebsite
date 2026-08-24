// Verificador OFICIAL de cobertura i18n (parser robusto, sin depender de indentación).
const fs = require('fs');
const path = require('path');

function pairsOfBlock(text) {
  const map = new Set();
  const re = /^[ \t]*([A-Za-z0-9_]+)\s*:\s*(['"])([\s\S]*?)\2\s*,?\s*$/gm;
  for (const m of text.matchAll(re)) map.add(m[1]);
  return map;
}

const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'idioma.js'), 'utf8').replace(/\r\n/g, '\n');
const ptText = fs.readFileSync(path.join(__dirname, '..', 'js', 'idioma-pt.js'), 'utf8').replace(/\r\n/g, '\n');
const frText = fs.readFileSync(path.join(__dirname, '..', 'js', 'idioma-fr.js'), 'utf8').replace(/\r\n/g, '\n');

const esStart = src.indexOf('es: {');
const enStart = src.search(/\n\s*en\s*:\s*\{/);
const ES = pairsOfBlock(src.slice(src.indexOf('\n', esStart), enStart));
const EN = pairsOfBlock(src.slice(enStart));
const PT = pairsOfBlock(ptText);
const FR = pairsOfBlock(frText);

const usadas = new Set([...ES]);
/* claves usadas en HTML/JS */
const dirHtml = path.join(__dirname, '..');
for (const f of fs.readdirSync(dirHtml).filter(f => f.endsWith('.html'))) {
  const s = fs.readFileSync(path.join(dirHtml, f), 'utf8');
  for (const m of s.matchAll(/data-i18n(?:-placeholder|-title)?="([^"]+)"/g)) usadas.add(m[1]);
}
for (const j of ['index.js', 'destino.js', 'paises.js', 'perfil.js', 'contacto.js', 'contact-form.js',
  'account.js', 'ayuda.js', 'sobrenosotros.js', 'package-request.js', 'traveler-registration.js',
  'guide-registration.js', 'chatbot-widget.js']) {
  const p = path.join(dirHtml, 'js', j);
  if (!fs.existsSync(p)) continue;
  const s = fs.readFileSync(p, 'utf8');
  for (const m of s.matchAll(/\b[tT]\(\s*'([^']+)'/g)) usadas.add(m[1]);
}

console.log('Universo: ' + ES.size + ' claves ES (' + usadas.size + ' usadas activamente)');
for (const [name, set] of [['EN', EN], ['PT', PT], ['FR', FR]]) {
  const faltaUsadas = [...usadas].filter(k => !set.has(k));
  const faltaTotal = [...ES].filter(k => !set.has(k));
  console.log(`${name}: propias ${set.size}/${ES.size}` +
    (faltaUsadas.length ? ` | ⚠ faltan ${faltaUsadas.length} USADAS: ${faltaUsadas.slice(0, 10).join(', ')}` : ' | usadas ✅') +
    (faltaTotal.length ? ` | contenido profundo sin traducir: ${faltaTotal.length} (cae a EN)` : ' | 100% completa ✅'));
}
