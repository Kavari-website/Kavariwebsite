// Fragmento 5: logica principal
const fs = require('fs');
const BASE = 'C:/Users/usuario/Downloads/Kavari1.4/Kavariwebsite/';

Object.assign(L, L3, L4);

function escDq(s){ return String(s).replace(/\\/g,'\\\\').replace(/"/g,'\\"'); }
function cap(s){ if(!s) return s; return s.charAt(0).toUpperCase()+s.slice(1); }
function pluralFr(w){ return w+'s'; }

const PHRASES = [
  ["patrimonio de la humanidad","patrimoine de l'humanité"],
  ["patrimonio mundial","patrimoine mondial"],
  ["patrimonio cultural","patrimoine culturel"],
  ["centro histórico","centre historique"],
  ["casco histórico","centre historique"],
  ["compañía aérea","compagnie aérienne"],
  ["compania aerea","compagnie aérienne"],
  ["parque nacional","parc national"],
  ["sitio arqueológico","site archéologique"],
  ["zona arqueológica","zone archéologique"],
  ["pueblos indígenas","peuples autochtones"],
  ["área protegida","aire protégée"],
  ["pinturas rupestres","peintures rupestres"],
  ["línea de","ligne de"],
  ["avistamiento de","observation de"],
  ["mar caribe","mer des Caraïbes"],
  ["costa caribe","côte caribéenne"],
  ["islas","îles"]
];

function traducir(text){
  if(text===null||text===undefined) return text;
  let t = String(text);
  for(const [s,f] of PHRASES){ t = t.replace(new RegExp(s,'gi'), f); }
  const SEP = /([\s.,;:·|()"'°%º+­—–…!?\/]+)/;
  const toks = t.split(SEP);
  const out = toks.map(tok=>{
    if(tok==="") return tok;
    if(/^[\s.,;:·|()"'°%º+­—–…!?\/]+$/.test(tok)) return tok;
    if(/^[0-9.,+\-/%º° ]+$/.test(tok)) return tok;
    if(/^\{.*\}$/.test(tok)) return tok;
    if(/^<.*>$/.test(tok)) return tok;
    const lower = tok.toLowerCase();
    let tr = L[lower];
    if(tr===undefined){
      if(lower.length>2 && lower.endsWith('s') && !lower.endsWith('is') && L[lower.slice(0,-1)]){
        tr = pluralFr(L[lower.slice(0,-1)]);
      } else if(lower.length>3 && lower.endsWith('es') && L[lower.slice(0,-2)]){
        tr = pluralFr(L[lower.slice(0,-2)]);
      }
    }
    if(tr===undefined) tr = tok;
    if(tok===tok.toUpperCase() && tok.length>1 && /[A-ZÁÉÍÓÚÑ]/.test(tok)) return tr;
    if(/[A-ZÁÉÍÓÚÑ]/.test(tok.charAt(0))) return cap(tr);
    return tr;
  });
  return out.join('');
}

let fr = fs.readFileSync(BASE+'js/idioma-fr.js','utf8');

let updatedGaps = 0;
for(const [k,frVal] of Object.entries(GAPS)){
  const re = new RegExp("(\\n\\s*" + k + "\\s*:\\s*)(['\"])((?:\\\\.|[^'\"\\n])*?)(\\2)");
  if(re.test(fr)){
    fr = fr.replace(re, (m,p1)=> p1 + '"' + escDq(frVal) + '"');
    updatedGaps++;
  }
}

const real = JSON.parse(fs.readFileSync(BASE+'scripts/fr-faltantes-real.json','utf8'));
const existing = new Set();
const reK = /^\s*([A-Za-z0-9_]+):/gm; let mm;
while((mm=reK.exec(fr))) existing.add(mm[1]);

let added = 0;
let add = '\n\n  /* ─── Traducciones completadas (países / fr-faltantes-real) ─── */\n';
for(const r of real){
  if(existing.has(r.k)) continue;
  const fv = traducir(r.es);
  add += '  ' + r.k + ': "' + escDq(fv) + '",\n';
  existing.add(r.k);
  added++;
}

fr = fr.replace(/};\s*$/, add + "};\n");
fs.writeFileSync(BASE+'js/idioma-fr.js', fr, 'utf8');
console.log('gaps actualizadas:', updatedGaps, '| claves pais agregadas:', added);
