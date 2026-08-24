// Quita "Paquete" de los títulos en data.json y agrega traducciones
// (ES/EN/PT) de título+descripción para los 19 países que faltaban.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

/* ── 1. data.json: títulos sin la palabra "Paquete" ── */
const dFile = path.join(ROOT, 'data', 'data.json');
const data = JSON.parse(fs.readFileSync(dFile, 'utf8'));
let titulos = 0;
Object.values(data.paquetes).forEach(p => {
  if (typeof p.title === 'string' && p.title.startsWith('Paquete ')) {
    p.title = p.title.slice('Paquete '.length);
    titulos++;
  }
});
fs.writeFileSync(dFile, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('data.json: títulos actualizados =', titulos);

/* ── 2. Traducciones nuevas por país ── */
const T = {
  es: {
    Mexico: ['México', 'Cancún y la Riviera Maya todo incluido: Chichén Itzá, cenotes sagrados e Isla Mujeres en 5 días.'],
    Peru: ['Perú', 'Cusco y Machu Picchu en tren panorámico: ciudad imperial, Valle Sagrado y la ciudadela inca en 4 días.'],
    CostaRica: ['Costa Rica', 'Ecoturismo puro: volcán Arenal, aguas termales, bosque nuboso de Monteverde y playas del Pacífico.'],
    Colombia: ['Colombia', 'Cartagena amurallada, las islas del Rosario y Medellín con su comuna 13 y metro cable.'],
    Brasil: ['Brasil', 'Río de Janeiro: Cristo Redentor, Pan de Azúcar, Copacabana y una noche de samba en 6 días.'],
    Argentina: ['Argentina', 'Buenos Aires porteña, show de tango y las Cataratas del Iguazú por el lado argentino.'],
    Chile: ['Chile', 'Santiago y el Valle de Atacama: géiseres del Tatio, valles de sal y lagunas altiplánicas.'],
    CostaRica_: null,
    Ecuador: ['Ecuador', 'Quito colonial, la Mitad del Mundo y el mercado indígena de Otavalo en 5 días.'],
    Cuba: ['Cuba', 'La Habana clásica, Viñales y playa todo incluido en Varadero al ritmo del son cubano.'],
    Guatemala: ['Guatemala', 'Antigua colonial, Lago Atitlán y los templos mayas de Tikal entre la selva.'],
    Bolivia: ['Bolivia', 'La Paz andina, Isla del Sol en el Titicaca y el espejo de sal de Uyuni en 4x4.'],
    Venezuela: ['Venezuela', 'Isla Margarita y sobrevuelo al Salto Ángel, la caída de agua más alta del mundo.'],
    Uruguay: ['Uruguay', 'Montevideo, Colonia histórica y Punta del Este con degustación de vinos Tannat.'],
    Paraguay: ['Paraguay', 'Asunción, la represa de Itaipú y las misiones jesuíticas declaradas Patrimonio de la Humanidad.'],
    Honduras: ['Honduras', 'Roatán y su arrecife de coral más las ruinas mayas de Copán en un solo viaje.'],
    Nicaragua: ['Nicaragua', 'Granada colonial, volcán Masaya activo y la isla volcánica de Ometepe.'],
    Belice: ['Belice', 'Cayo Ambergris: snorkel con tiburones nodriza, cuevas mayas y ruinas Xunantunich.'],
    Guyana: ['Guyana', 'Selva amazónica virgen y las imponentes cataratas Kaieteur desde Georgetown.'],
    RepublicaDominicana: ['República Dominicana', 'Punta Cana todo incluido: catamarán por Bávaro, Hoyo Azul y playas caribeñas.']
  },
  en: {
    Mexico: ['Mexico', 'All-inclusive Cancún and Riviera Maya: Chichén Itzá, sacred cenotes and Isla Mujeres in 5 days.'],
    Peru: ['Peru', 'Cusco and Machu Picchu on a panoramic train: imperial city, Sacred Ridge and the Inca citadel in 4 days.'],
    CostaRica: ['Costa Rica', 'Pure ecotourism: Arenal volcano, hot springs, the Monteverde cloud forest and Pacific beaches.'],
    Colombia: ['Colombia', 'Walled Cartagena, the Rosario Islands and Medellín with Comuna 13 and its metro cable.'],
    Brasil: ['Brazil', 'Rio de Janeiro: Christ the Redeemer, Sugarloaf Mountain, Copacabana and a samba night in 6 days.'],
    Argentina: ['Argentina', 'Buenos Aires, a tango dinner show and the mighty Iguazú Falls on the Argentine side.'],
    Chile: ['Chile', 'Santiago and the Atacama Desert: Tatio geysers, salt valleys and high-altitude lagoons.'],
    Ecuador: ['Ecuador', 'Colonial Quito, the Middle of the World and Otavalo indigenous market in 5 days.'],
    Cuba: ['Cuba', 'Classic Havana, Viñales valley and an all-inclusive stay in Varadero to son rhythms.'],
    Guatemala: ['Guatemala', 'Colonial Antigua, Lake Atitlán and the Maya temples of Tikal deep in the jungle.'],
    Bolivia: ['Bolivia', 'Andean La Paz, Sun Island on Titicaca and the Uyuni salt mirror by 4x4.'],
    Venezuela: ['Venezuela', 'Margarita Island and a flight over Angel Falls, the world\'s highest waterfall.'],
    Uruguay: ['Uruguay', 'Montevideo, historic Colonia and Punta del Este with Tannat wine tasting.'],
    Paraguay: ['Paraguay', 'Asunción, the Itaipú dam and Jesuit missions declared World Heritage Sites.'],
    Honduras: ['Honduras', 'Roatán and its barrier reef plus the Maya ruins of Copán in a single trip.'],
    Nicaragua: ['Nicaragua', 'Colonial Granada, active Masaya volcano and the volcanic island of Ometepe.'],
    Belice: ['Belize', 'Ambergris Caye: snorkel with nurse sharks, Maya caves and the Xunantunich ruins.'],
    Guyana: ['Guyana', 'Pristine Amazon rainforest and the mighty Kaieteur Falls from Georgetown.'],
    RepublicaDominicana: ['Dominican Republic', 'All-inclusive Punta Cana: catamaran along Bávaro, Hoyo Azul and Caribbean beaches.']
  },
  pt: {
    Mexico: ['México', 'Cancún e Riviera Maya tudo incluído: Chichén Itzá, cenotes sagrados e Isla Mujeres em 5 dias.'],
    Peru: ['Peru', 'Cusco e Machu Picchu de trem panorâmico: cidade imperial, Vale Sagrado e a cidadela inca em 4 dias.'],
    CostaRica: ['Costa Rica', 'Ecoturismo puro: vulcão Arenal, águas termais, floresta nublada de Monteverde e praias do Pacífico.'],
    Colombia: ['Colômbia', 'Cartagena murada, as ilhas do Rosário e Medellín com sua comuna 13 e metrô cabo.'],
    Brasil: ['Brasil', 'Rio de Janeiro: Cristo Redentor, Pão de Açúcar, Copacabana e uma noite de samba em 6 dias.'],
    Argentina: ['Argentina', 'Buenos Aires, show de tango com jantar e as Cataratas do Iguaçu pelo lado argentino.'],
    Chile: ['Chile', 'Santiago e o Deserto do Atacama: gêiseres del Tatio, vales de sal e lagoas altiplânicas.'],
    Ecuador: ['Equador', 'Quito colonial, a Metade do Mundo e o mercado indígena de Otavalo em 5 dias.'],
    Cuba: ['Cuba', 'Havana clássica, Viñales e praia tudo incluído em Varadero ao ritmo do son cubano.'],
    Guatemala: ['Guatemala', 'Antigua colonial, o Lago Atitlán e os templos maias de Tikal no meio da selva.'],
    Bolivia: ['Bolívia', 'La Paz andina, Ilha do Sol no Titicaca e o espelho de sal de Uyuni de 4x4.'],
    Venezuela: ['Venezuela', 'Ilha de Margarita e sobrevoou o Salto Ángel, a queda d\'água mais alta do mundo.'],
    Uruguay: ['Uruguai', 'Montevidéu, Colônia histórica e Punta del Este com degustação de vinho Tannat.'],
    Paraguay: ['Paraguai', 'Assunção, a usina de Itaipu e as missões jesuíticas declaradas Patrimônio da Humanidade.'],
    Honduras: ['Honduras', 'Roatán e seu recife de coral mais as ruínas maias de Copán em uma única viagem.'],
    Nicaragua: ['Nicarágua', 'Granada colonial, vulcão Masaya ativo e a ilha vulcânica de Ometepe.'],
    Belice: ['Belize', 'Caye Ambergris: snorkel com tubarões-nutriz, cavernas maias e ruínas Xunantunich.'],
    Guyana: ['Guiana', 'Floresta amazônica preservada e as impressionantes cataratas Kaieteur saindo de Georgetown.'],
    RepublicaDominicana: ['República Dominicana', 'Punta Cana tudo incluído: catamarã pela Bávaro, Hoyo Azul e praias caribenhas.']
  }
};
delete T.es.CostaRica_;

function buildBlock(langMap) {
  return Object.entries(langMap).map(([k, [title, desc]]) =>
    `            paquete${k}Titulo: '${title.replace(/'/g, "\\'")}',\n` +
    `            paquete${k}Desc: '${desc.replace(/'/g, "\\'")}',`
  ).join('\n');
}

/* Anclas únicas por bloque de idioma */
const anchors = {
  es: "paqueteElSalvadorDesc: 'Descubre El Salvador con traslados cómodos",
  en: "paqueteElSalvadorDesc: 'Discover El Salvador",
  pt: "paqueteElSalvadorDesc: 'Descubra El Salvador"
};

for (const [lang, anchor] of Object.entries(anchors)) {
  const f = lang === 'pt' ? path.join(ROOT, 'js', 'idioma-pt.js') : path.join(ROOT, 'js', 'idioma.js');
  let src = fs.readFileSync(f, 'utf8');
  const idx = src.indexOf(anchor);
  if (idx < 0) { console.error('ANCLA NO ENCONTRADA en', f); process.exit(1); }
  const lineEnd = src.indexOf('\n', idx);
  // quitar coma final de la línea ancla si la tiene y añadir bloque
  const lineText = src.slice(idx, lineEnd).replace(/,\s*$/, '');
  src = src.slice(0, idx) + lineText + ',\n' + buildBlock(T[lang]) + src.slice(lineEnd);
  fs.writeFileSync(f, src, 'utf8');
  console.log('Traducciones agregadas:', path.basename(f));
}
console.log('LISTO');
