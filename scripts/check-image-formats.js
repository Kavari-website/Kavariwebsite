#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let total = 0, png = 0, webp = 0, other = 0;
const list = [];

function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (!/\.jpg$/i.test(e.name)) continue;
    total++;
    const fd = fs.openSync(p, 'r');
    const b = Buffer.alloc(12);
    fs.readSync(fd, b, 0, 12, 0);
    fs.closeSync(fd);
    const s = b.toString('hex');
    if (s.startsWith('89504e47')) { png++; list.push('PNG: ' + p); }
    else if (s.startsWith('52494646')) { webp++; list.push('WEBP: ' + p); }
    else if (!s.startsWith('ffd8ff')) { other++; list.push('OTRO: ' + p); }
  }
}

walk(path.join(ROOT, 'img'));
console.log(`total=${total} png=${png} webp=${webp} otro=${other}`);
console.log(list.join('\n'));
