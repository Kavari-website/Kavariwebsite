// Completa el portugués al 100% (50 claves que caían al español).
// Nota: planViajeroF1 dice "36 destinos" -> se corrige a 21.
const fs = require('fs');
const path = require('path');
const f = path.join(__dirname, '..', 'js', 'idioma-pt.js');
let s = fs.readFileSync(f, 'utf8');

const T = {
  footerLinkDestinos: 'Destinos',
  footerNewsTitle: 'Newsletter',
  navDestinos: 'Destinos',
  tutorial: 'Tutorial',
  contactoSuperate: 'Centro Supérate David',
  navPaises: 'Países',
  navCultura: 'Cultura',
  navDestinos2: 'Destinos',
  navAventura: 'Aventura',
  heroExplorarDestinos: 'Explorar destinos',
  culturaTitulo: 'Cultura',
  paisesContinenteTodos: 'Todos',
  paisesContinenteAmerica: 'América',
  paisesContinenteCaribe: 'Caribe',
  paisesContinenteEuropa: 'Europa',
  paisesContinenteAfrica: 'África',
  perfilOtpEnviar: 'Enviar código',
  perfilOtpVerificar: 'Verificar código',
  rankDiamante: 'Diamante',
  desde: 'A partir de',
  cuentaPassVer: 'Mostrar',
  ayudaAtajoDestinos: 'Explorar destinos',
  ayudaAtajoTutorial: 'Iniciar tutorial',
  contactoInstagram: 'Instagram',
  contactoUbicacionVal: 'Centro Supérate David, Chiriquí, Panamá',
  tituloDestino: 'Destino — KAVARI Travel',
  seleccionarPais: 'País',
  buscarPais: 'Buscar país…',
  planCtaTelefonoPH: '+507 6000-0000',
  planCtaViajerosPH: '2',
  verDestinoCompleto: 'Ver destino completo',
  paisesDestinos: 'destinos',
  perfilTabFavoritos: 'Favoritos',
  perfilFavoritosSortLabel: 'Ordenar por',
  perfilFavoritosSortManual: 'Manual',
  perfilFavoritosExplorar: 'Explorar destinos',
  perfilConfigIdioma: 'Idioma',
  planViajeroF1: '21 destinos',
  planPremiumNombre: 'Premium',
  planPremiumPrecio: 'US$9.99',
  planOpNombre: 'OP',
  planOpPrecio: 'US$19.99',
  aboutStatDestinos: 'Destinos',
  aboutStatEquipo: 'Integrantes',
  aboutProgramador: 'Programador',
  filtroTodos: 'Todos',
  contratar: 'Contratar',
  precioHora: 'por hora',
  zonaLabel: 'Zona',
  entradaLabel: 'Entrada'
};

const anchor = "reservarEstadia: 'Ver opções na zona',";
if (!s.includes(anchor)) { console.error('ANCLA NO ENCONTRADA'); process.exit(1); }
let agregadas = 0;
const lines = Object.entries(T).map(([k, v]) => {
  agregadas++;
  return `            ${k}: '${v}',`;
}).join('\n');
s = s.replace(anchor, anchor + '\n' + lines);

/* faq10a: añadir Francés a la lista de idiomas si aún no lo menciona */
s = s.replace(/KAVARI está disponível em Espanhol, Inglês e Português/g,
  'KAVARI está disponível em Espanhol, Inglês, Português e Francês');

fs.writeFileSync(f, s, 'utf8');
console.log('PT: claves agregadas =', agregadas);
