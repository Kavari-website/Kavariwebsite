// Script temporal: reemplaza los paquetes de data.json por 21 paquetes
// (uno por país del sitio), con precios basados en cotizaciones reales.
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'data.json');
const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const pp = n => `$${n.toLocaleString('en-US')} <span>por persona</span>`;

const P = {};

P['mexico'] = {
  img: 'img/mexico/mexico.jpeg',
  title: 'Paquete México',
  precio: pp(790),
  desc: 'Cancún y la Riviera Maya en 5 días: hotel todo incluido en la Zona Hotelera, visita a Chichén Itzá, cenotes sagrados y Isla Mujeres. Precio referenciado en ofertas reales de vuelo+hotel (Expedia/deturista, desde $450–$900 según temporada).',
  includes: ['Vuelo redondo', 'Hotel todo incluido (4 noches)', 'Tour Chichén Itzá con almuerzo', 'Excursión a cenote sagrado', 'Isla Mujeres en catamarán', 'Traslados aeropuerto-hotel', 'Impuestos y seguros'],
  itinerary: [
    { dia: 'Día 1', titulo: 'Llegada a Cancún', texto: 'Traslado al resort todo incluido y tarde libre en la playa.' },
    { dia: 'Día 2', titulo: 'Chichén Itzá', texto: 'Zona arqueológica, cenote Ik Kil y almuerzo típico yucateco.' },
    { dia: 'Día 3', titulo: 'Isla Mujeres', texto: 'Catamarán con snorkel en el arrecife y tiempo libre en la isla.' },
    { dia: 'Día 4', titulo: 'Riviera Maya', texto: 'Día libre: Tulum, Xcaret o descanso en el resort.' },
    { dia: 'Día 5', titulo: 'Regreso', texto: 'Mañana libre y traslado al aeropuerto.' }
  ],
  pais: 'mexico'
};

P['peru'] = {
  img: 'img/banners/bannerdeperu.jpeg',
  title: 'Paquete Perú',
  precio: pp(520),
  desc: 'Cusco y Machu Picchu en 4 días: ciudad imperial, Valle Sagrado y la maravilla inca en tren panorámico. Basado en tarifas vigentes de operadores locales ($430–$950 por persona según hotel).',
  includes: ['Vuelo Lima-Cusco-Lima', 'Hotel 3 estrellas (3 noches)', 'City tour + Sacsayhuamán', 'Valle Sagrado con almuerzo', 'Machu Picchu en tren Expedition', 'Traslados y guía certificado'],
  itinerary: [
    { dia: 'Día 1', titulo: 'Llegada a Cusco', texto: 'Traslado al hotel y adaptación a la altura.' },
    { dia: 'Día 2', titulo: 'Valle Sagrado', texto: 'Pisac, Ollantaytambo y Chinchero con almuerzo buffet.' },
    { dia: 'Día 3', titulo: 'Machu Picchu', texto: 'Tren panorámico, guiado completo y regreso a Cusco.' },
    { dia: 'Día 4', titulo: 'Regreso', texto: 'Mañana libre y vuelo de salida.' }
  ],
  pais: 'peru'
};

P['panama'] = {
  img: 'img/banners/bannerdepanama.jpeg',
  title: 'Paquete Panamá',
  precio: pp(690),
  desc: 'Lo mejor de Panamá en 5 días: Canal de Panamá, Casco Viejo colonial y las playas paradisíacas de Guna Yala en San Blas.',
  includes: ['Traslados aeropuerto-hotel', 'Hotel 4 estrellas (4 noches)', 'Entrada Miraflores Canal', 'Tour Casco Viejo', 'Excursión San Blas día completo', 'Desayuno diario', 'Seguro de viaje'],
  itinerary: [
    { dia: 'Día 1', titulo: 'Llegada a Panamá', texto: 'Traslado al hotel y bienvenida.' },
    { dia: 'Día 2', titulo: 'El Gran Canal', texto: 'Esclusas de Miraflores y Biomuseo. Tarde en Casco Viejo.' },
    { dia: 'Día 3', titulo: 'Casco Viejo', texto: 'Tour histórico y cultural por el casco antiguo.' },
    { dia: 'Día 4', titulo: 'San Blas', texto: 'Día completo en las islas de la comarca Guna Yala.' },
    { dia: 'Día 5', titulo: 'Regreso', texto: 'Mañana libre y traslado al aeropuerto.' }
  ],
  pais: 'panama'
};

P['republica-dominicana'] = {
  img: 'img/republica-dominicana/republica dominicana.jpeg',
  title: 'Paquete República Dominicana',
  precio: pp(1150),
  desc: 'Punta Cana todo incluido en 5 días: playas de Bávaro, catamarán y vida caribeña. Precio referenciado en paquetes reales vuelo+resort ($1,190–$1,600 según temporada).',
  includes: ['Vuelo redondo', 'Resort todo incluido (4 noches)', 'Catamarán con snorkel', 'Hoyo Azul + buggy adventure', 'Show dominicano nocturno', 'Traslados incluidos'],
  itinerary: [
    { dia: 'Día 1', titulo: 'Llegada a Punta Cana', texto: 'Bienvenida al resort frente al mar Caribe.' },
    { dia: 'Día 2', titulo: 'Playa y snorkel', texto: 'Catamarán por la costa de Bávaro con parada de snorkel.' },
    { dia: 'Día 3', titulo: 'Aventura', texto: 'Hoyo Azul cenote azul turquesa y ruta en buggy.' },
    { dia: 'Día 4', titulo: 'Día libre', texto: 'Playa, spa o excursión a Isla Saona (opcional).' },
    { dia: 'Día 5', titulo: 'Regreso', texto: 'Mañana libre y traslado al aeropuerto.' }
  ],
  pais: 'republica-dominicana'
};

P['brasil'] = {
  img: 'img/brasil/brasil.jpg',
  title: 'Paquete Brasil',
  precio: pp(980),
  desc: 'Río de Janeiro en 6 días: Copacabana, Cristo Redentor, Pan de Azúcar y samba. Precios reales de mercado: $970–$1,200 con vuelo y hotel desde Buenos Aires (deturista/Ikatu).',
  includes: ['Vuelo redondo', 'Hotel con desayuno (5 noches)', 'Cristo Redentor + tren Corcovado', 'Pan de Azúcar en teleférico', 'Tour Copacabana e Ipanema', 'Show de samba nocturno', 'Traslados'],
  itinerary: [
    { dia: 'Día 1', titulo: 'Llegada a Río', texto: 'Traslado al hotel cerca de Copacabana.' },
    { dia: 'Día 2', titulo: 'Cristo Redentor', texto: 'Tren al Corcovado y tarde en Santa Teresa.' },
    { dia: 'Día 3', titulo: 'Pan de Azúcar', texto: 'Teleférico, centro histórico y Lapa.' },
    { dia: 'Día 4', titulo: 'Playas', texto: 'Ipanema, Leblon y atardecer en Arpoador.' },
    { dia: 'Día 5', titulo: 'Samba', texto: 'Día libre y show de samba por la noche.' },
    { dia: 'Día 6', titulo: 'Regreso', texto: 'Traslado al aeropuerto.' }
  ],
  pais: 'brasil'
};

P['argentina'] = {
  img: 'img/argentina/argentina.jpeg',
  title: 'Paquete Argentina',
  precio: pp(890),
  desc: 'Buenos Aires e Iguazú en 6 días: tango, Recoleta y las cataratas más impresionantes de Sudamérica por lado argentino.',
  includes: ['Vuelos internos BA-Iguazú-BA', 'Hoteles 4 estrellas (5 noches)', 'City tour Buenos Aires', 'Show de tango con cena', 'Cataratas lado argentino con tren ecológico', 'Traslados'],
  itinerary: [
    { dia: 'Día 1', titulo: 'Buenos Aires', texto: 'Llegada y recorrido por el Microcentro.' },
    { dia: 'Día 2', titulo: 'Ciudad porteña', texto: 'La Boca, San Telmo, Palermo y show de tango con cena.' },
    { dia: 'Día 3', titulo: 'Hacia Iguazú', texto: 'Vuelo a Puerto Iguazú y tarde libre.' },
    { dia: 'Día 4', titulo: 'Cataratas', texto: 'Garganta del Diablo y circuitos superior e inferior.' },
    { dia: 'Día 5', titulo: 'Regreso a BA', texto: 'Vuelo y última noche porteña.' },
    { dia: 'Día 6', titulo: 'Salida', texto: 'Traslado al aeropuerto.' }
  ],
  pais: 'argentina'
};

P['chile'] = {
  img: 'img/banners/bannerdechile.jpeg',
  title: 'Paquete Chile',
  precio: pp(950),
  desc: 'Santiago y Valle de Atacama en 6 días: la capital andina, géiseres del Tatio, lagunas altiplánicas y valles de sal a más de 2,400 m.',
  includes: ['Vuelo Santiago-Calama-Santiago', 'Hoteles (5 noches)', 'City tour Santiago + Cerro San Cristóbal', 'Valle de la Luna y Valle de la Muerte', 'Géiseres del Tatio con desayuno', 'Lagunas Altiplánicas', 'Guía especializado'],
  itinerary: [
    { dia: 'Día 1', titulo: 'Santiago', texto: 'Llegada y city tour con cerro San Cristóbal.' },
    { dia: 'Día 2', titulo: 'Camino a Atacama', texto: 'Vuelo a Calama y traslado a San Pedro.' },
    { dia: 'Día 3', titulo: 'Valles de sal', texto: 'Valle de la Luna al atardecer y Lagunas Altiplánicas.' },
    { dia: 'Día 4', titulo: 'Géiseres del Tatio', texto: 'Salida al amanecer a los géiseres y pueblo de Machuca.' },
    { dia: 'Día 5', titulo: 'San Pedro libre', texto: 'Lagunas Cejar o descanso en el pueblo.' },
    { dia: 'Día 6', titulo: 'Regreso', texto: 'Vuelo a Santiago y conexión.' }
  ],
  pais: 'chile'
};

P['costa-rica'] = {
  img: 'img/banners/bannerdecostarica.jpeg',
  title: 'Paquete Costa Rica',
  precio: pp(760),
  desc: 'Ecoturismo puro en 6 días: volcán Arenal, aguas termales, bosque nuboso de Monteverde y playas del Pacífico central.',
  includes: ['Traslados privados 4x4', 'Lodge en Arenal (2 noches)', 'Hotel en Monteverde (2 noches)', 'Aguas termales Tabacón', 'Puentes colgantes del dosel', 'Tour de canopy', 'Desayunos'],
  itinerary: [
    { dia: 'Día 1', titulo: 'San José - Arenal', texto: 'Traslado al pie del volcán Arenal.' },
    { dia: 'Día 2', titulo: 'Termales', texto: 'Caminata al volcán y tarde en aguas termales.' },
    { dia: 'Día 3', titulo: 'Monteverde', texto: 'Traslado al bosque nuboso y canopy.' },
    { dia: 'Día 4', titulo: 'Dosel nuboso', texto: 'Puentes colgantes y reserva biológica.' },
    { dia: 'Día 5', titulo: 'Pacífico', texto: 'Playas de Manuel Antonio (opcional).' },
    { dia: 'Día 6', titulo: 'Regreso', texto: 'Traslado a San José o aeropuerto.' }
  ],
  pais: 'costa-rica'
};

P['colombia'] = {
  img: 'img/banners/bannerdecolombia.jpeg',
  title: 'Paquete Colombia',
  precio: pp(720),
  desc: 'Cartagena y Medellín en 6 días: la ciudad amurallada, las islas del Rosario y la comuna 13 con su arte urbano.',
  includes: ['Vuelo interno Cartagena-Medellín', 'Hoteles boutique (5 noches)', 'City tour Cartagena amurallada', 'Islas del Rosario en lancha', 'Comuna 13 con metro cable', 'Tour café y Comuna 13', 'Desayunos'],
  itinerary: [
    { dia: 'Día 1', titulo: 'Cartagena', texto: 'Llegada y paseo por la ciudad amurallada.' },
    { dia: 'Día 2', titulo: 'Islas del Rosario', texto: 'Día de playa y snorkel en el archipiélago.' },
    { dia: 'Día 3', titulo: 'Volcán y bazurto', texto: 'Totumo y mercados locales (opcional).' },
    { dia: 'Día 4', titulo: 'Medellín', texto: 'Vuelo y tour de la comuna 13 con graffiti.' },
    { dia: 'Día 5', titulo: 'Metro cable', texto: 'Parque Arví y barrio El Poblado.' },
    { dia: 'Día 6', titulo: 'Regreso', texto: 'Traslado al aeropuerto.' }
  ],
  pais: 'colombia'
};

P['ecuador'] = {
  img: 'img/banners/bannerdeecuador.jpeg',
  title: 'Paquete Ecuador',
  precio: pp(750),
  desc: 'Quito y Otavalo en 5 días: el centro histórico mejor preservado de América, la mitad del mundo y el mercado indígena más famoso.',
  includes: ['Traslados privados', 'Hotel 4 estrellas (4 noches)', 'Centro histórico de Quito (UNESCO)', 'Mitad del Mundo', 'Mercado indígena de Otavalo', 'Laguna Cuicocha', 'Desayunos'],
  itinerary: [
    { dia: 'Día 1', titulo: 'Quito', texto: 'Llegada y tarde en La Mariscal.' },
    { dia: 'Día 2', titulo: 'Quito colonial', texto: 'Basílica, La Compañía y Panecillo.' },
    { dia: 'Día 3', titulo: 'Mitad del Mundo', texto: 'Museo de la línea ecuatorial y volcán Pululahua.' },
    { dia: 'Día 4', titulo: 'Otavalo', texto: 'Mercado indígena, Cotacachi y Cuicocha.' },
    { dia: 'Día 5', titulo: 'Regreso', texto: 'Traslado al aeropuerto.' }
  ],
  pais: 'ecuador'
};

P['cuba'] = {
  img: 'img/banners/bannerdecuba.jpeg',
  title: 'Paquete Cuba',
  precio: pp(780),
  desc: 'La Habana y Varadero en 6 días: clásicos americanos, son cubano, mojitos en La Bodeguita y arena blanca en Varadero.',
  includes: ['Hotel en La Habana (2 noches)', 'Resort todo incluido Varadero (3 noches)', 'Tour Habana Vieja en clásico', 'Show de son cubano', 'Excursión Valle de Viñales', 'Traslados'],
  itinerary: [
    { dia: 'Día 1', titulo: 'La Habana', texto: 'Llegada y paseo por el Malecón.' },
    { dia: 'Día 2', titulo: 'Habana Vieja', texto: 'Plaza Vieja, Capitolio y Bodeguita del Medio.' },
    { dia: 'Día 3', titulo: 'Viñales', texto: 'Excursión al valle y plantaciones de tabaco.' },
    { dia: 'Día 4', titulo: 'Varadero', texto: 'Traslado al resort todo incluido.' },
    { dia: 'Día 5', titulo: 'Caribe', texto: 'Playa, catamarán y cueva de saturno (opcional).' },
    { dia: 'Día 6', titulo: 'Regreso', texto: 'Traslado al aeropuerto.' }
  ],
  pais: 'cuba'
};

P['guatemala'] = {
  img: 'img/banners/bannerdeguatemala.jpeg',
  title: 'Paquete Guatemala',
  precio: pp(590),
  desc: 'Antigua, Lago Atitlán y Tikal en 6 días: ciudades coloniales, volcanes activos y templos mayas entre la selva.',
  includes: ['Transporte privado', 'Hoteles (5 noches)', 'Antigua Guatemala colonial', 'Lago Atitlán y pueblo maya', 'Ruinas de Tikal con guía', 'Volcán Pacaya (opcional)', 'Desayunos'],
  itinerary: [
    { dia: 'Día 1', titulo: 'Ciudad de Guatemala', texto: 'Llegada y traslado a Antigua.' },
    { dia: 'Día 2', titulo: 'Antigua', texto: 'Ruinas coloniales, arco de Santa Catalina y Hobbitenango.' },
    { dia: 'Día 3', titulo: 'Atitlán', texto: 'Lago, San Juan La Laguna y miradores.' },
    { dia: 'Día 4', titulo: 'Flores - Tikal', texto: 'Vuelo a Flores y tarde libre.' },
    { dia: 'Día 5', titulo: 'Tikal', texto: 'Templos mayas al amanecer en la selva.' },
    { dia: 'Día 6', titulo: 'Regreso', texto: 'Vuelo a Guatemala y conexión.' }
  ],
  pais: 'guatemala'
};

P['bolivia'] = {
  img: 'img/banners/bannerdebolivia.jpeg',
  title: 'Paquete Bolivia',
  precio: pp(560),
  desc: 'La Paz y Salar de Uyuni en 5 días: teleferico urbano, isla del Sol en Titicaca y el espejo de sal más grande del mundo.',
  includes: ['Hotel en La Paz (2 noches)', 'Refugio en Uyuni (1 noche)', 'Teleférico Mi Teleférico', 'Isla del Sol en lancha', 'Salar de Uyuni 4x4 completo', 'Incahuasi y trenes abandonados'],
  itinerary: [
    { dia: 'Día 1', titulo: 'La Paz', texto: 'Llegada y teleférico con vistas andinas.' },
    { dia: 'Día 2', titulo: 'Titicaca', texto: 'Copacabana e Isla del Sol.' },
    { dia: 'Día 3', titulo: 'Hacia Uyuni', texto: 'Vuelo o bus nocturno a Uyuni.' },
    { dia: 'Día 4', titulo: 'Salar', texto: '4x4 por el salar, Incahuasi y atardecer.' },
    { dia: 'Día 5', titulo: 'Regreso', texto: 'Colores del desierto y vuelo de salida.' }
  ],
  pais: 'bolivia'
};

P['venezuela'] = {
  img: 'img/venezuela/bannervenezuela2.jpg',
  title: 'Paquete Venezuela',
  precio: pp(650),
  desc: 'Margarita y Canaima en 6 días: playas caribeñas, fortaleza colonial y sobrevuelo al Salto Ángel, la caída de agua más alta del planeta.',
  includes: ['Vuelo interno a Canaima', 'Hoteles (5 noches)', 'Tour Porlamar y La Asunción', 'Sobrevuelo Salto Ángel', 'Parque Nacional Canaima', 'Ferry a Coche (opcional)'],
  itinerary: [
    { dia: 'Día 1', titulo: 'Margarita', texto: 'Llegada y playa de El Yaque.' },
    { dia: 'Día 2', titulo: 'Isla', texto: 'Tour insular: Juangriego y fortín España.' },
    { dia: 'Día 3', titulo: 'Canaima', texto: 'Vuelo al parque nacional y Laguna de Canaima.' },
    { dia: 'Día 4', titulo: 'Salto Ángel', texto: 'Sobrevuelo del salto más alto del mundo.' },
    { dia: 'Día 5', titulo: 'Regreso a Margarita', texto: 'Vuelo de vuelta y última tarde de playa en Porlamar.' },
    { dia: 'Día 6', titulo: 'Regreso', texto: 'Traslado al aeropuerto.' }
  ],
  pais: 'venezuela'
};

P['uruguay'] = {
  img: 'img/banners/bannerdeuruguay.jpeg',
  title: 'Paquete Uruguay',
  precio: pp(820),
  desc: 'Montevideo, Colonia y Punta del Este en 6 días: ramblas, ciudad histórica UNESCO y la playa más glamorosa del Río de la Plata.',
  includes: ['Hoteles (5 noches)', 'City tour Montevideo', 'Colonia del Sacramento (UNESCO)', 'Punta del Este y Casapueblo', 'Bodega vinícola con degustación', 'Ferry o transporte terrestre', 'Desayunos'],
  itinerary: [
    { dia: 'Día 1', titulo: 'Montevideo', texto: 'Llegada y rambla con parrilla típica.' },
    { dia: 'Día 2', titulo: 'Ciudad vieja', texto: 'Mercado del Puerto y teatro Solís.' },
    { dia: 'Día 3', titulo: 'Colonia', texto: 'Barrio histórico portugués junto al río.' },
    { dia: 'Día 4', titulo: 'Punta del Este', texto: 'Mano en la arena y Casapueblo.' },
    { dia: 'Día 5', titulo: 'Vinos', texto: 'Bodega familiar y degustación de Tannat.' },
    { dia: 'Día 6', titulo: 'Regreso', texto: 'Traslado a Montevideo o ferry a Buenos Aires.' }
  ],
  pais: 'uruguay'
};

P['paraguay'] = {
  img: 'img/banners/bannerdeparaguay.jpeg',
  title: 'Paquete Paraguay',
  precio: pp(590),
  desc: 'Asunción y las Misiones jesuíticas en 5 días: capital ribereña, ruinas guaraníes UNESCO y la represa de Itaipú.',
  includes: ['Hotel en Asunción (4 noches)', 'City tour capital', 'Ruinas jesuíticas de Trinidad (UNESCO)', 'Represa de Itaipú', 'Encarnación y costanera', 'Degustación de tereré y cocina guaraní'],
  itinerary: [
    { dia: 'Día 1', titulo: 'Asunción', texto: 'Llegada y palacio de López con el malecón.' },
    { dia: 'Día 2', titulo: 'Capital', texto: 'Casa de la Independencia y Mercado 4.' },
    { dia: 'Día 3', titulo: 'Itaipú', texto: 'Visita a la represa binacional y Ciudad del Este.' },
    { dia: 'Día 4', titulo: 'Misiones', texto: 'Ruinas de Trinidad y Jesús de Tavarangüe.' },
    { dia: 'Día 5', titulo: 'Regreso', texto: 'Últimas compras y traslado al aeropuerto.' }
  ],
  pais: 'paraguay'
};

P['honduras'] = {
  img: 'img/banners/bannerdehonduras.jpeg',
  title: 'Paquete Honduras',
  precio: pp(640),
  desc: 'Roatán y Copán en 6 días: el arrecife de coral más grande del hemisferio norte y la Atenas maya declarada Patrimonio de la Humanidad.',
  includes: ['Vuelo interno a San Pedro Sula', 'Resort en Roatán (3 noches)', 'Snorkel en West Bay', 'Gira delfines/Gumbalimba', 'Ruinas de Copán con guía', 'Traslados y desayunos'],
  itinerary: [
    { dia: 'Día 1', titulo: 'Roatán', texto: 'Llegada a la isla de las Bahamas hondureñas.' },
    { dia: 'Día 2', titulo: 'Arrecife', texto: 'Snorkel en West Bay y playa.' },
    { dia: 'Día 3', titulo: 'Isla', texto: 'Parque Gumbalimba y manglares.' },
    { dia: 'Día 4', titulo: 'Copán', texto: 'Vuelo/terrestre hacia las ruinas mayas.' },
    { dia: 'Día 5', titulo: 'Mayas', texto: 'Gran Plaza, escalinata jeroglífica y túneles.' },
    { dia: 'Día 6', titulo: 'Regreso', texto: 'Traslado al aeropuerto.' }
  ],
  pais: 'honduras'
};

P['nicaragua'] = {
  img: 'img/banners/bannerdenicaragua.jpeg',
  title: 'Paquete Nicaragua',
  precio: pp(540),
  desc: 'Granada, Masaya y Ometepe en 6 días: colonialismo colorido, volcanes activos y una isla gemela en el lago Cocibolca.',
  includes: ['Hotel colonial en Granada (2 noches)', 'Lodge en Ometepe (2 noches)', 'Volcán Masaya con lava activa', 'Islas Granadas en lancha', 'Cerro Negro sandboarding (opcional)', 'Desayunos y traslados'],
  itinerary: [
    { dia: 'Día 1', titulo: 'Managua - Granada', texto: 'Llegada y paseo en calesa por Granada.' },
    { dia: 'Día 2', titulo: 'Masaya', texto: 'Volcán activo con mirada a la lava y mercado artesanal.' },
    { dia: 'Día 3', titulo: 'Ometepe', texto: 'Ferry a la isla de los dos volcanes.' },
    { dia: 'Día 4', titulo: 'Isla', texto: 'Ojo de agua y cascada San Ramón.' },
    { dia: 'Día 5', titulo: 'Apoyo', texto: 'Laguna craterica Apoyo (opcional).' },
    { dia: 'Día 6', titulo: 'Regreso', texto: 'Traslado a Managua.' }
  ],
  pais: 'nicaragua'
};

P['el-salvador'] = {
  img: 'img/banners/bannerdelsalvador.jpeg',
  title: 'Paquete El Salvador',
  precio: pp(490),
  desc: 'Ruta de las Flores y playas de surf en 5 días: pueblos pintorescos, lagos volcánicos, Joya de Cerén (UNESCO) y la ola del Sunzal.',
  includes: ['Hotel en San Salvador (2 noches)', 'Cabaña en la playa (2 noches)', 'Ruta de las Flores completa', 'Joya de Cerén (UNESCO)', 'Lago de Coatepeque', 'Clase de surf en El Tunco', 'Traslados'],
  itinerary: [
    { dia: 'Día 1', titulo: 'San Salvador', texto: 'Llegada y centro histórico renovado.' },
    { dia: 'Día 2', titulo: 'Ruta de las Flores', texto: 'Juayúa, Apaneca y miradores de cafe.' },
    { dia: 'Día 3', titulo: 'Cerén', texto: 'La Pompeya de América y lago Coatepeque.' },
    { dia: 'Día 4', titulo: 'Surf', texto: 'Playa El Tunco y clase de surf.' },
    { dia: 'Día 5', titulo: 'Regreso', texto: 'Compra de café y traslado al aeropuerto.' }
  ],
  pais: 'el-salvador'
};

P['belice'] = {
  img: 'img/banners/bannerdebelice.jpeg',
  title: 'Paquete Belice',
  precio: pp(850),
  desc: 'Cayo Ambergris y las cuevas mayas en 5 días: la segunda barrera de coral más grande del mundo, tiburones nodriza y ruinas Xunantunich.',
  includes: ['Water taxi o vuelo interno', 'Resort en Cayo Ambergris (4 noches)', 'Snorkel Hol Chan con rayas y tiburones', 'Cave tubing en cuevas mayas', 'Ruinas de Xunantunich', 'Desayunos y traslados'],
  itinerary: [
    { dia: 'Día 1', titulo: 'Ambergris Caye', texto: 'Llegada a San Pedro y playa.' },
    { dia: 'Día 2', titulo: 'Hol Chan', texto: 'Snorkel con tiburones nodriza y mantarrayas.' },
    { dia: 'Día 3', titulo: 'Cuevas', texto: 'Cave tubing en el río subterráneo.' },
    { dia: 'Día 4', titulo: 'Xunantunich', texto: 'Ruinas mayas y mercado de San Ignacio.' },
    { dia: 'Día 5', titulo: 'Regreso', texto: 'Traslado al aeropuerto internacional.' }
  ],
  pais: 'belice'
};

P['guyana'] = {
  img: 'img/banners/bannerdeguyana.jpeg',
  title: 'Paquete Guyana',
  precio: pp(980),
  desc: 'Georgetown y Kaieteur en 5 días: naturaleza virgen amazónica, las cataratas de una sola caída más potentes del mundo y lodges de selva.',
  includes: ['Lodge de selva (2 noches)', 'Hotel en Georgetown (2 noches)', 'Vuelo a las cataratas Kaieteur', 'Rio Essequibo y islotes', 'Iwokrama y canopy', 'Guías naturales bilingües'],
  itinerary: [
    { dia: 'Día 1', titulo: 'Georgetown', texto: 'Llegada y catedral de madera St. George.' },
    { dia: 'Día 2', titulo: 'Kaieteur', texto: 'Vuelo sobre la selva a las cataratas (226 m).' },
    { dia: 'Día 3', titulo: 'Selva', texto: 'Traslado a lodge en el interior.' },
    { dia: 'Día 4', titulo: 'Essequibo', texto: 'Río, islas y fauna amazónica.' },
    { dia: 'Día 5', titulo: 'Regreso', texto: 'Regreso a Georgetown y salida.' }
  ],
  pais: 'guyana'
};

data.paquetes = P;
fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');

const count = Object.keys(data.paquetes).length;
console.log('OK — paquetes escritos: ' + count);
