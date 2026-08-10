#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'data.json'), 'utf8'));

const refs = [];
function walk(o) {
  if (Array.isArray(o)) { o.forEach(walk); return; }
  if (!o || typeof o !== 'object') return;
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (typeof v === 'string' && v.startsWith('img/')) refs.push(v);
    else walk(v);
  }
}
walk(data);

const uniq = [...new Set(refs)];
let bad = 0;
for (const r of uniq) {
  const fp = path.join(ROOT, r.replace(/\//g, path.sep));
  if (!fs.existsSync(fp)) { console.log('FALTA: ' + r); bad++; }
  else if (fs.statSync(fp).size < 2000) { console.log('ROTO: ' + r); bad++; }
}
console.log(`Refs únicos: ${uniq.length} | Problemas: ${bad}`);
