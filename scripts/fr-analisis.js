// Analiza repetición de valores ES entre las claves FR pendientes.
const fs = require('fs');
const pend = JSON.parse(fs.readFileSync(__dirname + '/fr-faltantes-real.json', 'utf8'));

const porValor = {};
for (const { k, es } of pend) {
  const norm = String(es).trim();
  (porValor[norm] = porValor[norm] || []).push(k);
}
const unicos = Object.entries(porValor);
const repetidos = unicos.filter(([, ks]) => ks.length > 1);
console.log('Claves pendientes:', pend.length);
console.log('Valores únicos a traducir:', unicos.length);
console.log('Valores repetidos (≥2 países):', repetidos.length, '→ cubren', repetidos.reduce((a, [, ks]) => a + ks.length, 0), 'claves');
console.log('Valores de un solo uso:', unicos.length - repetidos.length);

/* Guardar lista única para traducir */
fs.writeFileSync(__dirname + '/fr-unicos.json',
  JSON.stringify(unicos.sort((a, b) => b[1].length - a[1].length).map(([v, ks]) => ({ v, n: ks.length, keys: ks })), null, 0));
console.log('Guardado scripts/fr-unicos.json');
