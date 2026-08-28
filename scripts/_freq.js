const fs = require('fs');
function getObj(p){ const c = fs.readFileSync(p,'utf8'); const m = c.match(/=\s*\{([\s\S]*?)\};/); return eval('({' + m[1] + '})'); }
const L = Object.assign({}, getObj('_frag2.js'), getObj('_frag3.js'), getObj('_frag4.js'));
const real = JSON.parse(fs.readFileSync('fr-faltantes-real.json','utf8'));
const fr = fs.readFileSync('../js/idioma-fr.js','utf8');
const existing = new Set();
const reK = /^\s*([A-Za-z0-9_]+):/gm; let mm;
while((mm=reK.exec(fr))) existing.add(mm[1]);
const freq = {};
for (const r of real){
  const toks = String(r.es).toLowerCase().split(/[^a-záéíóúñü]+/i).filter(Boolean);
  for (const t of toks){
    if (L[t] !== undefined) continue;
    if (/^[0-9]+$/.test(t)) continue;
    freq[t] = (freq[t]||0)+1;
  }
}
const top = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,200);
console.log('distinct untranslated tokens:', Object.keys(freq).length);
console.log(top.map(([w,c])=>w+'('+c+')').join(' '));
