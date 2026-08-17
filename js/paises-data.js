// ============================================================
// KAVARI – Datos de los 21 destinos (paises.html)
// Nombre, descripción, época, idioma y moneda en ES / EN / PT
// Imágenes locales por país + continentes para el filtro.
// ============================================================
window.KAVARI_PAISES = [
  {
    code: 'panama',
    region: 'latam',
    continentes: ['america'],
    img: 'img/Panama.webp',
    nombre: { es: 'Panamá', en: 'Panama', pt: 'Panamá' },
    desc: {
      es: 'Casco Viejo, Canal de Panamá, BioMuseo, Islas Taboga y comunidades Guna en San Blas.',
      en: 'Casco Viejo, Panama Canal, BioMuseum, Taboga Islands, and Guna communities in San Blas.',
      pt: 'Casco Viejo, Canal do Panamá, BioMuseo, Ilhas Taboga e comunidades Guna em San Blas.'
    },
    epoca: { es: 'Diciembre - Abril', en: 'December - April', pt: 'Dezembro - Abril' },
    idioma: { es: 'Español', en: 'Spanish', pt: 'Espanhol' },
    moneda: { es: 'Dólar estadounidense (USD) / Balboa (PAB)', en: 'US Dollar (USD) / Balboa (PAB)', pt: 'Dólar americano (USD) / Balboa (PAB)' }
  },
  {
    code: 'colombia',
    region: 'latam',
    continentes: ['america'],
    img: 'img/Colombia.webp',
    nombre: { es: 'Colombia', en: 'Colombia', pt: 'Colômbia' },
    desc: {
      es: 'Cartagena amurallada, Islas del Rosario, Valle del Cauca y comunidades Wayuu en La Guajira.',
      en: 'Walled Cartagena, Rosario Islands, Cauca Valley, and Wayuu communities in La Guajira.',
      pt: 'Cartagena amuralhada, Ilhas do Rosário, Vale do Cauca e comunidades Wayuu em La Guajira.'
    },
    epoca: { es: 'Diciembre - Marzo', en: 'December - March', pt: 'Dezembro - Março' },
    idioma: { es: 'Español', en: 'Spanish', pt: 'Espanhol' },
    moneda: { es: 'Peso colombiano (COP)', en: 'Colombian Peso (COP)', pt: 'Peso colombiano (COP)' }
  },
  {
    code: 'mexico',
    region: 'latam',
    continentes: ['america'],
    img: 'img/Mexico.jpg',
    nombre: { es: 'México', en: 'Mexico', pt: 'México' },
    desc: {
      es: 'Ciudad de México, Teotihuacán, Oaxaca, Cancún y comunidades zapotecas del sur.',
      en: 'Mexico City, Teotihuacán, Oaxaca, Cancún, and southern Zapotec communities.',
      pt: 'Cidade do México, Teotihuacán, Oaxaca, Cancún e comunidades zapotecas do sul.'
    },
    epoca: { es: 'Diciembre - Abril, Julio - Agosto', en: 'December - April, July - August', pt: 'Dezembro - Abril, Julho - Agosto' },
    idioma: { es: 'Español (oficial), 68 lenguas indígenas reconocidas', en: 'Spanish (official), 68 recognized indigenous languages', pt: 'Espanhol (oficial), 68 línguas indígenas reconhecidas' },
    moneda: { es: 'Peso mexicano (MXN)', en: 'Mexican Peso (MXN)', pt: 'Peso mexicano (MXN)' }
  },
  {
    code: 'costa-rica',
    region: 'latam',
    continentes: ['america'],
    img: 'img/Costa_Rica.jpg',
    nombre: { es: 'Costa Rica', en: 'Costa Rica', pt: 'Costa Rica' },
    desc: {
      es: 'Volcán Arenal, Manuel Antonio, tortugas en Tortuguero y ecoturismo en la selva.',
      en: 'Arenal Volcano, Manuel Antonio, turtles in Tortuguero, and rainforest ecotourism.',
      pt: 'Vulcão Arenal, Manuel Antonio, tartarugas em Tortuguero e ecoturismo na selva.'
    },
    epoca: { es: 'Diciembre - Abril', en: 'December - April', pt: 'Dezembro - Abril' },
    idioma: { es: 'Español', en: 'Spanish', pt: 'Espanhol' },
    moneda: { es: 'Colón costarricense (CRC)', en: 'Costa Rican Colón (CRC)', pt: 'Colón costarriquenho (CRC)' }
  },
  {
    code: 'peru',
    region: 'latam',
    continentes: ['america'],
    img: 'img/Peru.webp',
    nombre: { es: 'Perú', en: 'Peru', pt: 'Peru' },
    desc: {
      es: 'Machu Picchu, Valle Sagrado, Cusco y rituales andinos con comunidades quechuas.',
      en: 'Machu Picchu, Sacred Valley, Cusco, and Andean rituals with Quechua communities.',
      pt: 'Machu Picchu, Vale Sagrado, Cusco e rituais andinos com comunidades quechuas.'
    },
    epoca: { es: 'Junio - Agosto', en: 'June - August', pt: 'Junho - Agosto' },
    idioma: { es: 'Español (oficial), 40+ lenguas originarias (quechua, aimara)', en: 'Spanish (official), 40+ indigenous languages (Quechua, Aymara)', pt: 'Espanhol (oficial), 40+ línguas originárias (quíchua, aimará)' },
    moneda: { es: 'Sol peruano (PEN)', en: 'Peruvian Sol (PEN)', pt: 'Sol peruano (PEN)' }
  },
  {
    code: 'republica-dominicana',
    region: 'latam',
    continentes: ['caribe'],
    img: 'img/República_Dominicana.jpg',
    nombre: { es: 'República Dominicana', en: 'Dominican Republic', pt: 'República Dominicana' },
    desc: {
      es: 'Punta Cana, Santo Domingo colonial, Samaná y experiencias afrocaribeñas.',
      en: 'Punta Cana, colonial Santo Domingo, Samaná, and Afro-Caribbean experiences.',
      pt: 'Punta Cana, Santo Domingo colonial, Samaná e experiências afro-caribenhas.'
    },
    epoca: { es: 'Diciembre - Abril', en: 'December - April', pt: 'Dezembro - Abril' },
    idioma: { es: 'Español', en: 'Spanish', pt: 'Espanhol' },
    moneda: { es: 'Peso dominicano (DOP)', en: 'Dominican Peso (DOP)', pt: 'Peso dominicano (DOP)' }
  },
  {
    code: 'argentina',
    region: 'latam',
    continentes: ['america'],
    img: 'img/Argentina.jpg',
    nombre: { es: 'Argentina', en: 'Argentina', pt: 'Argentina' },
    desc: {
      es: 'Buenos Aires, Patagonia, Cataratas del Iguazú, Mendoza y los glaciares patagónicos.',
      en: 'Buenos Aires, Patagonia, Iguazú Falls, Mendoza, and Patagonian glaciers.',
      pt: 'Buenos Aires, Patagônia, Cataratas do Iguaçu, Mendoza e as geleiras patagônicas.'
    },
    epoca: { es: 'Diciembre - Febrero', en: 'December - February', pt: 'Dezembro - Fevereiro' },
    idioma: { es: 'Español', en: 'Spanish', pt: 'Espanhol' },
    moneda: { es: 'Peso argentino (ARS)', en: 'Argentine Peso (ARS)', pt: 'Peso argentino (ARS)' }
  },
  {
    code: 'brasil',
    region: 'latam',
    continentes: ['america'],
    img: 'img/Brasil.jpg',
    nombre: { es: 'Brasil', en: 'Brazil', pt: 'Brasil' },
    desc: {
      es: 'Río de Janeiro, São Paulo, Amazonas, Pantanal y las playas de Florianópolis.',
      en: 'Rio de Janeiro, São Paulo, Amazon, Pantanal, and the beaches of Florianópolis.',
      pt: 'Rio de Janeiro, São Paulo, Amazônia, Pantanal e as praias de Florianópolis.'
    },
    epoca: { es: 'Diciembre - Marzo', en: 'December - March', pt: 'Dezembro - Março' },
    idioma: { es: 'Portugués', en: 'Portuguese', pt: 'Português' },
    moneda: { es: 'Real brasileño (BRL)', en: 'Brazilian Real (BRL)', pt: 'Real brasileiro (BRL)' }
  },
  {
    code: 'chile',
    region: 'latam',
    continentes: ['america'],
    img: 'img/Chile.webp',
    nombre: { es: 'Chile', en: 'Chile', pt: 'Chile' },
    desc: {
      es: 'Santiago, Atacama, Torres del Paine, Isla de Pascua y los viñedos del Valle Central.',
      en: 'Santiago, Atacama, Torres del Paine, Easter Island, and Central Valley vineyards.',
      pt: 'Santiago, Atacama, Torres del Paine, Ilha de Páscoa e os vinhedos do Vale Central.'
    },
    epoca: { es: 'Diciembre - Febrero', en: 'December - February', pt: 'Dezembro - Fevereiro' },
    idioma: { es: 'Español', en: 'Spanish', pt: 'Espanhol' },
    moneda: { es: 'Peso chileno (CLP)', en: 'Chilean Peso (CLP)', pt: 'Peso chileno (CLP)' }
  },
  {
    code: 'ecuador',
    region: 'latam',
    continentes: ['america'],
    img: 'img/Ecuador.webp',
    nombre: { es: 'Ecuador', en: 'Ecuador', pt: 'Equador' },
    desc: {
      es: 'Islas Galápagos, Quito colonial, selva amazónica y comunidades Kichwa en el Oriente.',
      en: 'Galápagos Islands, colonial Quito, Amazon rainforest, and Kichwa communities in the Oriente.',
      pt: 'Ilhas Galápagos, Quito colonial, selva amazônica e comunidades Kichwa no Oriente.'
    },
    epoca: { es: 'Junio - Septiembre', en: 'June - September', pt: 'Junho - Setembro' },
    idioma: { es: 'Español', en: 'Spanish', pt: 'Espanhol' },
    moneda: { es: 'Dólar estadounidense (USD)', en: 'US Dollar (USD)', pt: 'Dólar americano (USD)' }
  },
  {
    code: 'cuba',
    region: 'latam',
    continentes: ['caribe'],
    img: 'img/Cuba.webp',
    nombre: { es: 'Cuba', en: 'Cuba', pt: 'Cuba' },
    desc: {
      es: 'La Habana Vieja, Varadero, Trinidad colonial, música son y cultura afrocubana.',
      en: 'Old Havana, Varadero, colonial Trinidad, son music, and Afro-Cuban culture.',
      pt: 'Habana Vieja, Varadero, Trinidad colonial, música son e cultura afro-cubana.'
    },
    epoca: { es: 'Diciembre - Abril', en: 'December - April', pt: 'Dezembro - Abril' },
    idioma: { es: 'Español', en: 'Spanish', pt: 'Espanhol' },
    moneda: { es: 'Peso cubano (CUP)', en: 'Cuban Peso (CUP)', pt: 'Peso cubano (CUP)' }
  },
  {
    code: 'guatemala',
    region: 'latam',
    continentes: ['america'],
    img: 'img/Guatemala.webp',
    nombre: { es: 'Guatemala', en: 'Guatemala', pt: 'Guatemala' },
    desc: {
      es: 'Tikal, Antigua Guatemala, Lago Atitlán y comunidades mayas del altiplano occidental.',
      en: 'Tikal, Antigua Guatemala, Lake Atitlán, and Mayan communities in the western highlands.',
      pt: 'Tikal, Antígua Guatemala, Lago Atitlán e comunidades maias do altiplano ocidental.'
    },
    epoca: { es: 'Noviembre - Abril', en: 'November - April', pt: 'Novembro - Abril' },
    idioma: { es: 'Español (oficial), 22 idiomas mayas, xinca y garífuna', en: 'Spanish (official), 22 Mayan languages, Xinca, and Garífuna', pt: 'Espanhol (oficial), 22 idiomas maias, xinca e garífuna' },
    moneda: { es: 'Quetzal (GTQ)', en: 'Quetzal (GTQ)', pt: 'Quetzal (GTQ)' }
  },
  {
    code: 'bolivia',
    region: 'latam',
    continentes: ['america'],
    img: 'img/Bolivia.jpeg',
    nombre: { es: 'Bolivia', en: 'Bolivia', pt: 'Bolívia' },
    desc: {
      es: 'Salar de Uyuni, Lago Titicaca, La Paz y comunidades aymaras en el altiplano.',
      en: 'Salar de Uyuni, Lake Titicaca, La Paz, and Aymara communities on the Altiplano.',
      pt: 'Salar de Uyuni, Lago Titicaca, La Paz e comunidades aimarás no altiplano.'
    },
    epoca: { es: 'Mayo - Octubre', en: 'May - October', pt: 'Maio - Outubro' },
    idioma: { es: 'Español, quechua, aymara, guaraní y 33 lenguas originarias', en: 'Spanish, Quechua, Aymara, Guaraní, and 33 indigenous languages', pt: 'Espanhol, quíchua, aimará, guarani e 33 idiomas originários' },
    moneda: { es: 'Boliviano (BOB)', en: 'Boliviano (BOB)', pt: 'Boliviano (BOB)' }
  },
  {
    code: 'venezuela',
    region: 'latam',
    continentes: ['america'],
    img: 'img/Venezuela.webp',
    nombre: { es: 'Venezuela', en: 'Venezuela', pt: 'Venezuela' },
    desc: {
      es: 'Los Roques, Salto Ángel, Gran Sabana y tepuyes únicos en el mundo.',
      en: 'Los Roques, Angel Falls, Gran Sabana, and unique tepuis in the world.',
      pt: 'Los Roques, Salto Ángel, Gran Sabana e tepuyes únicos no mundo.'
    },
    epoca: { es: 'Diciembre - Abril', en: 'December - April', pt: 'Dezembro - Abril' },
    idioma: { es: 'Español', en: 'Spanish', pt: 'Espanhol' },
    moneda: { es: 'Bolívar soberano (VES)', en: 'Sovereign Bolívar (VES)', pt: 'Bolívar soberano (VES)' }
  },
  {
    code: 'uruguay',
    region: 'latam',
    continentes: ['america'],
    img: 'img/Uruguay.webp',
    nombre: { es: 'Uruguay', en: 'Uruguay', pt: 'Uruguai' },
    desc: {
      es: 'Montevideo, Punta del Este, Colonia del Sacramento y playas del Río de la Plata.',
      en: 'Montevideo, Punta del Este, Colonia del Sacramento, and Rio de la Plata beaches.',
      pt: 'Montevidéu, Punta del Este, Colônia do Sacramento e praias do Rio da Prata.'
    },
    epoca: { es: 'Diciembre - Marzo', en: 'December - March', pt: 'Dezembro - Março' },
    idioma: { es: 'Español', en: 'Spanish', pt: 'Espanhol' },
    moneda: { es: 'Peso uruguayo (UYU)', en: 'Uruguayan Peso (UYU)', pt: 'Peso uruguaio (UYU)' }
  },
  {
    code: 'paraguay',
    region: 'latam',
    continentes: ['america'],
    img: 'img/Paraguay.jpg',
    nombre: { es: 'Paraguay', en: 'Paraguay', pt: 'Paraguai' },
    desc: {
      es: 'Asunción, misiones jesuíticas, Pantanal paraguayo e historia guaraní.',
      en: 'Asunción, Jesuit missions, Paraguayan Pantanal, and Guaraní history.',
      pt: 'Assunção, missões jesuíticas, Pantanal paraguaio e história guarani.'
    },
    epoca: { es: 'Mayo - Septiembre', en: 'May - September', pt: 'Maio - Setembro' },
    idioma: { es: 'Español y guaraní', en: 'Spanish and Guaraní', pt: 'Espanhol e guarani' },
    moneda: { es: 'Guaraní (PYG)', en: 'Guaraní (PYG)', pt: 'Guarani (PYG)' }
  },
  {
    code: 'honduras',
    region: 'latam',
    continentes: ['america'],
    img: 'img/Honduras.webp',
    nombre: { es: 'Honduras', en: 'Honduras', pt: 'Honduras' },
    desc: {
      es: 'Copán Ruinas, Roatán y la Bahía de las Islas, arrecifes de coral y selva tropical.',
      en: 'Copán Ruins, Roatán, Bay Islands, coral reefs, and tropical rainforest.',
      pt: 'Copán Ruínas, Roatán e a Baía das Ilhas, recifes de coral e selva tropical.'
    },
    epoca: { es: 'Diciembre - Abril', en: 'December - April', pt: 'Dezembro - Abril' },
    idioma: { es: 'Español', en: 'Spanish', pt: 'Espanhol' },
    moneda: { es: 'Lempira (HNL)', en: 'Lempira (HNL)', pt: 'Lempira (HNL)' }
  },
  {
    code: 'nicaragua',
    region: 'latam',
    continentes: ['america'],
    img: 'img/Nicaragua.webp',
    nombre: { es: 'Nicaragua', en: 'Nicaragua', pt: 'Nicarágua' },
    desc: {
      es: 'Granada colonial, Isla de Ometepe, Lago Nicaragua y playas vírgenes del Pacífico.',
      en: 'Colonial Granada, Ometepe Island, Lake Nicaragua, and pristine Pacific beaches.',
      pt: 'Granada colonial, Ilha de Ometepe, Lago Nicarágua e praias virgens do Pacífico.'
    },
    epoca: { es: 'Diciembre - Abril', en: 'December - April', pt: 'Dezembro - Abril' },
    idioma: { es: 'Español', en: 'Spanish', pt: 'Espanhol' },
    moneda: { es: 'Córdoba (NIO)', en: 'Córdoba (NIO)', pt: 'Córdoba (NIO)' }
  },
  {
    code: 'el-salvador',
    region: 'latam',
    continentes: ['america'],
    img: 'img/El Salvadorpais.webp',
    nombre: { es: 'El Salvador', en: 'El Salvador', pt: 'El Salvador' },
    desc: {
      es: 'Ruta de las Flores, Lago Coatepeque, surf en El Tunco y ruinas de Tazumal.',
      en: 'Ruta de las Flores, Coatepeque Lake, surfing in El Tunco, and Tazumal ruins.',
      pt: 'Rota das Flores, Lago Coatepeque, surf em El Tunco e ruínas de Tazumal.'
    },
    epoca: { es: 'Diciembre - Abril', en: 'December - April', pt: 'Dezembro - Abril' },
    idioma: { es: 'Español', en: 'Spanish', pt: 'Espanhol' },
    moneda: { es: 'Dólar estadounidense (USD)', en: 'US Dollar (USD)', pt: 'Dólar estadunidense (USD)' }
  },
  {
    code: 'belice',
    region: 'latam',
    continentes: ['america'],
    img: 'img/Belice.jpg',
    nombre: { es: 'Belice', en: 'Belize', pt: 'Belize' },
    desc: {
      es: 'Gran Barrera de Coral, Caye Caulker, ruinas mayas de Caracol y selva tropical.',
      en: 'Great Barrier Reef, Caye Caulker, Mayan ruins of Caracol, and tropical rainforest.',
      pt: 'Grande Barreira de Coral, Caye Caulker, ruínas maias de Caracol e selva tropical.'
    },
    epoca: { es: 'Diciembre - Abril', en: 'December - April', pt: 'Dezembro - Abril' },
    idioma: { es: 'Inglés (oficial), español, criollo beliceño, maya, garífuna', en: 'English (official), Spanish, Belizean Creole, Maya, Garífuna', pt: 'Inglês (oficial), espanhol, crioulo belizenho, maia, garífuna' },
    moneda: { es: 'Dólar beliceño (BZD)', en: 'Belize Dollar (BZD)', pt: 'Dólar belizenho (BZD)' }
  },
  {
    code: 'guyana',
    region: 'latam',
    continentes: ['america'],
    img: 'img/Guyana.jpg',
    nombre: { es: 'Guyana', en: 'Guyana', pt: 'Guiana' },
    desc: {
      es: 'Kaieteur Falls, selva amazónica virgen, comunidades indígenas y aves exóticas.',
      en: 'Kaieteur Falls, virgin Amazon rainforest, indigenous communities, and exotic birds.',
      pt: 'Cachoeira Kaieteur, selva amazônica virgem, comunidades indígenas e aves exóticas.'
    },
    epoca: { es: 'Diciembre - Abril', en: 'December - April', pt: 'Dezembro - Abril' },
    idioma: { es: 'Inglés (oficial), criollo guyanés, lenguas indígenas (caribe, arawak, warao)', en: 'English (official), Guyanese Creole, indigenous languages (Carib, Arawak, Warao)', pt: 'Inglês (oficial), crioulo guianês, línguas indígenas (karib, arawak, warao)' },
    moneda: { es: 'Dólar guyanés (GYD)', en: 'Guyanese Dollar (GYD)', pt: 'Dólar guianês (GYD)' }
  }
];