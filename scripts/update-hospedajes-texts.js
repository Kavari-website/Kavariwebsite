// Actualiza textos de hospedajes: aclara que se muestran ZONAS amplias,
// no propiedades exactas. Aplica a ES/EN/PT.
const fs = require('fs');
const path = require('path');

const edits = [
  {
    file: path.join(__dirname, '..', 'js', 'idioma.js'),
    blocks: [
      {
        anchor: 'hospedajesDesc: "Opciones seleccionadas en los mejores barrios del destino.",',
        replace:
          'hospedajesDesc: "Referencias por zona: te mostramos áreas amplias del destino para que elijas dónde quedarte.",\n' +
          '            hospedajesZonaNota: "No mostramos propiedades exactas: cada tarjeta representa una zona. Al continuar verás todas las opciones reales disponibles de Airbnb en esa área.",\n' +
          '            zonaLabel: "Zona",'
      },
      {
        anchor: 'hospedajesDesc: "Selected options in the best neighborhoods.",',
        replace:
          'hospedajesDesc: "Area-based references: we show you broad areas of the destination so you can choose where to stay.",\n' +
          '            hospedajesZonaNota: "We do not list exact properties: each card represents a zone. Continue to see all real Airbnb options available in that area.",\n' +
          '            zonaLabel: "Zone",'
      }
    ]
  },
  {
    file: path.join(__dirname, '..', 'js', 'idioma-pt.js'),
    blocks: [
      {
        anchor: 'hospedajesDesc: "Opções selecionadas nos melhores bairros do destino.",',
        replace:
          'hospedajesDesc: "Referências por zona: mostramos áreas amplas do destino para você escolher onde ficar.",\n' +
          '            hospedajesZonaNota: "Não mostramos propriedades exatas: cada cartão representa uma zona. Ao continuar você verá todas as opções reais disponíveis do Airbnb nessa área.",\n' +
          '            zonaLabel: "Zona",'
      }
    ]
  }
];

for (const { file, blocks } of edits) {
  let src = fs.readFileSync(file, 'utf8');
  for (const { anchor, replace } of blocks) {
    if (!src.includes(anchor)) {
      console.error('ANCLA NO ENCONTRADA en ' + path.basename(file) + ': ' + anchor.slice(0, 50));
      process.exit(1);
    }
    src = src.replace(anchor, replace);
  }
  fs.writeFileSync(file, src, 'utf8');
  console.log('OK', path.basename(file));
}
console.log('LISTO');
