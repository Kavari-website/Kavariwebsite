const fs = require('fs');
const path = require('path');
let malas = 0;

function chk(f, cond, desc) {
  if (!cond) { console.log('✗ ' + f + ' -> ' + desc); malas++; }
}

const PAGES9 = ['index.html', 'destino.html', 'paises.html', 'perfil.html', 'planes.html',
  'contacto.html', 'cuenta.html', 'ayuda.html', 'sobrenosotros.html'];
const TRAVELER7 = ['ayuda', 'contacto', 'destino', 'index', 'paises', 'planes', 'sobrenosotros'];
const CHATBOT7 = ['index', 'destino', 'paises', 'contacto', 'ayuda', 'planes', 'sobrenosotros'];

for (const f of PAGES9) {
  const s = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  const base = f.replace('.html', '');
  if (s.length < 5000) { console.log('✗ ' + f + ' ARCHIVO DEMASIADO PEQUEÑO'); malas++; continue; }
  chk(f, s.includes('css/style.css?v=2'), 'style.css?v=2');
  chk(f, s.includes('js/scroll-lock.js?v=2'), 'scroll-lock v2');
  chk(f, s.includes('js/cookie-consent.js?v=1'), 'cookie-consent');
  chk(f, s.includes('js/idioma-fr.js?v=1'), 'idioma-fr');
  chk(f, !s.includes('\uFFFD'), 'sin caracteres corruptos');
  if (TRAVELER7.includes(base)) chk(f, s.includes('traveler-registration.css?v=2'), 'traveler v2');
  if (CHATBOT7.includes(base)) chk(f, s.includes('chatbot-widget.css?v=4'), 'chatbot v4');
  if (f !== 'index.html') chk(f, s.includes('kv-footer-legal'), 'footer legal');
}
const ix = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
chk('index', ix.includes('js/index.js?v=3'), 'index.js v3');
const dx = fs.readFileSync(path.join(__dirname, '..', 'destino.html'), 'utf8');
chk('destino', dx.includes('js/destino.js?v=5'), 'destino.js v5');
const cx = fs.readFileSync(path.join(__dirname, '..', 'contacto.html'), 'utf8');
chk('contacto', cx.includes('@emailjs/browser@4'), 'SDK EmailJS');

console.log(malas ? '✗ PROBLEMAS: ' + malas : '✅ LOS 9 ARCHIVOS ESTÁN COMPLETOS Y CORRECTOS');
