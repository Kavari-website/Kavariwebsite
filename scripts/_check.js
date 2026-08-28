const fs = require('fs');
const code = fs.readFileSync('_frag1.js','utf8');
const GAPS = eval('(function(){' + code.replace('const GAPS', 'var GAPS') + '; return GAPS;})()');
const gapsJson = JSON.parse(fs.readFileSync('gaps-fr.json','utf8'));
const fr = fs.readFileSync('../js/idioma-fr.js','utf8');
const eng = new Map(gapsJson.map(g => [g.key, g.actual]));
let miss = [];
for (const k of Object.keys(GAPS)) {
  const re = new RegExp('\\n\\s*' + k + '\\s*:\\s*([\'"])((?:\\\\.|[^\'"])*?)\\1');
  const m = fr.match(re);
  if (!m) { miss.push([k, 'NO_LINE']); continue; }
  const val = m[1];
  const english = eng.get(k);
  if (english && val === english) miss.push([k, 'STILL_ENGLISH', val]);
}
console.log('count missing:', miss.length);
for (const x of miss) console.log(JSON.stringify(x));
