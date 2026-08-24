// RECOVERY v2: re-aplica cambios de la sesión a los 9 HTML (maneja CRLF/LF y />).
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
let fallos = 0;

function rw(file, fn) {
  const p = path.join(ROOT, file);
  const raw = fs.readFileSync(p, 'utf8');
  const crlf = raw.includes('\r\n');
  let s = crlf ? raw.replace(/\r\n/g, '\n') : raw;
  s = fn(s);
  fs.writeFileSync(p, crlf ? s.replace(/\n/g, '\r\n') : s, 'utf8');
}

function patch(file, from, to) {
  rw(file, s => {
    if (s.includes(to)) { console.log('YA OK  [' + file + '] ' + to.slice(0, 45)); return s; }
    if (!s.includes(from)) { console.log('FALLO [' + file + '] ' + from.slice(0, 60).replace(/\n/g, '⏎')); fallos++; return s; }
    console.log('OK     [' + file + '] ' + to.replace(/\n/g, '⏎').slice(0, 55));
    return s.replace(from, to);
  });
}

function patchAny(file, [fromA, fromB], toA, toB) {
  rw(file, s => {
    if (s.includes(fromA)) { console.log('OK     [' + file + '] A'); return s.replace(fromA, toA); }
    if (fromB && s.includes(fromB)) { console.log('OK     [' + file + '] B'); return s.replace(fromB, toB); }
    if (s.includes(toA) || (toB && s.includes(toB))) { console.log('YA OK  [' + file + ']'); return s; }
    console.log('FALLO [' + file + '] ninguna variante: ' + fromA.slice(0, 50));
    fallos++;
    return s;
  });
}

const PAGES9 = ['index.html', 'destino.html', 'paises.html', 'perfil.html', 'planes.html',
  'contacto.html', 'cuenta.html', 'ayuda.html', 'sobrenosotros.html'];
const TRAVELER7 = ['ayuda.html', 'contacto.html', 'destino.html', 'index.html', 'paises.html', 'planes.html', 'sobrenosotros.html'];
const CHATBOT7 = ['index.html', 'destino.html', 'paises.html', 'contacto.html', 'ayuda.html', 'planes.html', 'sobrenosotros.html'];

/* 1. style.css v2 (dos formatos de cierre) */
for (const f of PAGES9) patchAny(f,
  ['href="css/style.css">', 'href="css/style.css"/>'],
  'href="css/style.css?v=2">', 'href="css/style.css?v=2"/>');

/* 2. idioma-fr después de idioma-pt */
for (const f of PAGES9) rw(f, s => {
  if (s.includes('idioma-fr.js')) { console.log('YA OK  [' + f + '] fr'); return s; }
  const m = s.match(/<script defer src="js\/idioma-pt\.js\?v=\d+"><\/script>/);
  if (!m) { console.log('FALLO [' + f + '] fr'); fallos++; return s; }
  console.log('OK     [' + f + '] tag fr');
  return s.replace(m[0], m[0] + '\n  <script defer src="js/idioma-fr.js?v=1"></script>');
});

/* 3. chatbot css v4 */
for (const f of CHATBOT7) patchAny(f,
  ['href="css/chatbot-widget.css">', 'href="css/chatbot-widget.css"/>'],
  'href="css/chatbot-widget.css?v=4">', 'href="css/chatbot-widget.css?v=4"/>');

/* 4. traveler css v2 */
for (const f of TRAVELER7) patchAny(f,
  ['href="css/traveler-registration.css">', 'href="css/traveler-registration.css"/>'],
  'href="css/traveler-registration.css?v=2">', 'href="css/traveler-registration.css?v=2"/>');

/* 5. Bloques de scripts por página */
patch('index.html',
  '<script src="js/account.js"></script>\n<script defer src="js/index.js?v=2"></script>',
  '<script src="js/account.js"></script>\n<script src="js/scroll-lock.js?v=2"></script>\n<script src="js/cookie-consent.js?v=1"></script>\n<script defer src="js/index.js?v=3"></script>');

patch('destino.html',
  '<script src="js/account.js"></script>\n<script src="js/traveler-registration.js"></script>',
  '<script src="js/account.js"></script>\n<script src="js/scroll-lock.js?v=2"></script>\n<script src="js/cookie-consent.js?v=1"></script>\n<script src="js/traveler-registration.js"></script>');
patch('destino.html', '<script src="js/destino.js?v=3"></script>', '<script src="js/destino.js?v=5"></script>');

patch('contacto.html',
  '<script src="js/account.js"></script>\n<script src="js/guide-registration.js"></script>',
  '<script src="js/account.js"></script>\n<script src="js/scroll-lock.js?v=2"></script>\n<script src="js/cookie-consent.js?v=1"></script>\n<script src="js/guide-registration.js"></script>');
patch('contacto.html',
  '<script src="js/contacto.js"></script>',
  '<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>\n<script src="js/contacto.js"></script>');

patch('cuenta.html',
  '<script src="js/account.js"></script>\n  <script src="js/tutorial.js"></script>',
  '<script src="js/account.js"></script>\n  <script src="js/scroll-lock.js?v=2"></script>\n  <script src="js/cookie-consent.js?v=1"></script>\n  <script src="js/tutorial.js"></script>');

patch('perfil.html',
  '<script src="js/account.js"></script>\n  <script src="js/perfil.js?v=2"></script>',
  '<script src="js/account.js"></script>\n  <script src="js/scroll-lock.js?v=2"></script>\n  <script src="js/cookie-consent.js?v=1"></script>\n  <script src="js/perfil.js?v=2"></script>');

patch('ayuda.html',
  '<script src="js/account.js"></script>\n<script src="js/traveler-registration.js"></script>',
  '<script src="js/account.js"></script>\n<script src="js/scroll-lock.js?v=2"></script>\n<script src="js/cookie-consent.js?v=1"></script>\n<script src="js/traveler-registration.js"></script>');

patch('sobrenosotros.html',
  '<script src="js/sobrenosotros.js"></script>\n<script src="js/guide-registration.js"></script>',
  '<script src="js/sobrenosotros.js"></script>\n<script src="js/scroll-lock.js?v=2"></script>\n<script src="js/cookie-consent.js?v=1"></script>\n<script src="js/guide-registration.js"></script>');

patch('paises.html',
  '<script defer src="js/paises.js?v=5"></script>\n<script defer src="js/guide-registration.js"></script>',
  '<script defer src="js/paises.js?v=5"></script>\n<script src="js/scroll-lock.js?v=2"></script>\n<script src="js/cookie-consent.js?v=1"></script>\n<script defer src="js/guide-registration.js"></script>');

patch('planes.html',
  '</script>\n<script src="js/guide-registration.js"></script>',
  '</script>\n<script src="js/scroll-lock.js?v=2"></script>\n<script src="js/cookie-consent.js?v=1"></script>\n<script src="js/guide-registration.js"></script>');

/* 6. Footer legal (8 páginas; index ya lo tiene) */
const LEGAL =
  '    <ul class="kv-footer-legal">\n' +
  '      <li><a class="kv-footer-link" href="privacidad.html" data-i18n="footerPrivacidad">Política de privacidad</a></li>\n' +
  '      <li><a class="kv-footer-link" href="terminos.html" data-i18n="footerTerminos">Términos y condiciones</a></li>\n' +
  '      <li><a class="kv-footer-link" href="cookies.html" data-i18n="footerCookies">Política de cookies</a></li>\n' +
  '    </ul>';
for (const f of PAGES9.filter(x => x !== 'index.html')) rw(f, s => {
  if (s.includes('kv-footer-legal')) { console.log('YA OK  [' + f + '] footer legal'); return s; }
  const i = s.indexOf('<p class="kv-footer-copy" data-i18n="footerTexto">');
  if (i < 0) { console.log('FALLO [' + f + '] footer copy'); fallos++; return s; }
  const le = s.indexOf('\n', i);
  console.log('OK     [' + f + '] footer legal');
  return s.slice(0, le + 1) + LEGAL + '\n' + s.slice(le + 1);
});

console.log(fallos ? '\n⚠ FALLOS PENDIENTES: ' + fallos : '\n✅ TODO APLICADO SIN ERRORES');
