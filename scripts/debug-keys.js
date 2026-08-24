const fs = require('fs');
const raw = fs.readFileSync('js/idioma.js', 'utf8');
const norm = raw.replace(/\r\n/g, '\n');
const re = /^\s+([A-Za-z0-9_]+)\s*:\s*(['"])([\s\S]*?)\2\s*,?\s*$/gm;

function keysOf(t){ return [...t.matchAll(re)].map(m=>m[1]); }
const kr = keysOf(raw.slice(1706, 648688));
const kn = keysOf(norm.slice(1653, 640775));
console.log('RAW:', kr.length, '| NORM:', kn.length);
const setR = new Set(kr), setN = new Set(kn);
const soloRaw = kr.filter(k=>!setN.has(k));
const soloNorm = kn.filter(k=>!setR.has(k));
console.log('solo en RAW:', soloRaw.length, soloRaw.slice(0,10));
console.log('solo en NORM:', soloNorm.length, soloNorm.slice(0,10));
// muestra una línea cruda de una clave solo-RAW
if(soloRaw[0]){
  const m = raw.slice(1706).match(new RegExp('^\\s+'+soloRaw[0]+'\\s*:.*$','m'));
  console.log('línea RAW:', JSON.stringify(m && m[0].slice(0,120)));
}
