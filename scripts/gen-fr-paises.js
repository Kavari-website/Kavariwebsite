// Genera el mapa FR del contenido de países:
// - Traducciones explícitas para textos únicos (darkBands, cronología, etiquetas)
// - Nombres propios (_nombre) se copian del español (convención en guías francesas)
const fs = require('fs');
const path = require('path');

const T = {
  paisesRegionLatam: "Amérique latine & Caraïbes",
  paisesRegionEuropa: "Europe",
  paisesRegionAsia: "Asie & Afrique",
  paisesVerDestino: "Voir la destination",
  paisesContinente: "Continent",
  paisesTagEpoca: "Meilleure période",
  paisesTagIdioma: "Langue",
  paisesTagMoneda: "Monnaie",
  paisesNoResultados: "Aucune destination trouvée pour",

  paisPanama_cultura_darkBand_titulo: "Un pays façonné par le monde",
  paisPanama_aventura_darkBand_titulo: "Un laboratoire naturel unique",
  paisPanama_historia_cronologia_0_titulo: "Premiers habitants",
  paisPanama_historia_cronologia_1_titulo: "Découverte de la Mer du Sud",
  paisPanama_historia_cronologia_2_titulo: "Indépendance de la Colombie",
  paisPanama_historia_cronologia_3_titulo: "Inauguration du Canal",
  paisPanama_historia_cronologia_4_titulo: "Rétrocession du Canal",
  paisCostaRica_cultura_darkBand_titulo: "Un pays sans armée depuis 1949",
  paisCostaRica_aventura_darkBand_titulo: "Le pays le plus heureux et durable",
  paisColombia_cultura_darkBand_titulo: "Fête, café et réalisme magique",
  paisColombia_aventura_darkBand_titulo: "Pays des contrastes verticaux",
  paisMexico_cultura_darkBand_titulo: "Un pays forgé par trois millénaires d'histoire",
  paisMexico_aventura_darkBand_titulo: "Un laboratoire naturel sans égal",
  paisPeru_cultura_darkBand_titulo: "Berceau de civilisations millénaires",
  paisPeru_aventura_darkBand_titulo: "Pays des paysages extrêmes",
  paisRepublicaDominicana_cultura_darkBand_titulo: "Première ville d'Amérique",
  paisRepublicaDominicana_aventura_darkBand_titulo: "Le toit des Caraïbes",
  paisArgentina_cultura_darkBand_titulo: "Berceau du tango et de l'asado",
  paisArgentina_aventura_darkBand_titulo: "Toit de l'Amérique et bout du monde",
  paisBrasil_cultura_darkBand_titulo: "Berceau de la samba et quintuple champion du monde",
  paisBrasil_aventura_darkBand_titulo: "Le poumon du monde",
  paisChile_cultura_darkBand_titulo: "Pays de poètes et de paysages extrêmes",
  paisChile_aventura_darkBand_titulo: "Le pays le plus long du monde",
  paisEcuador_cultura_darkBand_titulo: "Le pays du centre du monde",
  paisEcuador_aventura_darkBand_titulo: "Le pays des quatre mondes",
  paisCuba_cultura_darkBand_titulo: "Berceau du son, du mambo et de la salsa",
  paisCuba_aventura_darkBand_titulo: "La plus grande île des Caraïbes",
  paisGuatemala_cultura_darkBand_titulo: "Au cœur du monde maya",
  paisGuatemala_aventura_darkBand_titulo: "Pays du printemps éternel et de 37 volcans",
  paisBolivia_cultura_darkBand_titulo: "Pays de deux capitales et 36 langues",
  paisBolivia_aventura_darkBand_titulo: "Au cœur de l'Amérique du Sud",
  paisVenezuela_cultura_darkBand_titulo: "Terre du Libertador",
  paisVenezuela_aventura_darkBand_titulo: "Pays de la plus haute cascade du monde",
  paisUruguay_cultura_darkBand_titulo: "Pays du maté, du candombe et de la tranquillité",
  paisUruguay_aventura_darkBand_titulo: "La Suisse de l'Amérique",
  paisParaguay_cultura_darkBand_titulo: "Cœur bilingue de l'Amérique du Sud",
  paisParaguay_aventura_darkBand_titulo: "Pays des grands fleuves",
  paisHonduras_cultura_darkBand_titulo: "Cœur de la culture garifuna et maya",
  paisHonduras_aventura_darkBand_titulo: "Terre du récif mésoaméricain et de Copán",
  paisNicaragua_cultura_darkBand_titulo: "Terre de lacs et de volcans",
  paisNicaragua_aventura_darkBand_titulo: "Terre des requins d'eau douce",
  paisElSalvador_cultura_darkBand_titulo: "Pays des pupusas et du bitcoin",
  paisElSalvador_aventura_darkBand_titulo: "Le petit poumon de l'Amérique",
  paisBelice_cultura_darkBand_titulo: "Berceau du chocolat et de la punta rock",
  paisBelice_aventura_darkBand_titulo: "La deuxième plus grande barrière de corail du monde",
  paisGuyana_cultura_darkBand_titulo: "Pays de jungles et de culture caribéenne",
  paisGuyana_aventura_darkBand_titulo: "Le pays aux mille cascades",

  // Étiquettes répétées (infoCards / itinéraire / saisons) par valeur ES
  __labels: {
    "Moneda": "Devise",
    "Cómo llegar": "Comment y arriver",
    "Clima": "Climat",
    "Visas": "Visas",
    "Conectividad": "Connectivité",
    "Alojamiento": "Hébergement",
    "Temporada seca": "Saison sèche",
    "Temporada verde": "Saison verte",
    "Temporada lluviosa": "Saison des pluies",
    "Temporada alta": "Haute saison"
  }
};

/* Construir entradas por país usando fr-faltantes.json */
const pend = JSON.parse(fs.readFileSync(path.join(__dirname, 'fr-faltantes.json'), 'utf8'));
for (const { k, es } of pend) {
  if (!k.startsWith('pais')) continue;
  if (T[k] !== undefined) continue;
  // etiquetas repetidas por valor
  if (T.__labels[es] !== undefined) { T[k] = T.__labels[es]; continue; }
  // nombres propios y platos: copiar tal cual
  if (/_(nombre|titulo)$/.test(k) && !/_darkBand_|_cronologia_/.test(k)) { T[k] = es; continue; }
}
delete T.__labels;

fs.writeFileSync(path.join(__dirname, 'fr-parts', 'paises.json'),
  JSON.stringify(T, null, 1), 'utf8');
console.log('Entradas de países generadas:',
  Object.keys(T).filter(k => k.startsWith('pais') || k.startsWith('paises')).length);
