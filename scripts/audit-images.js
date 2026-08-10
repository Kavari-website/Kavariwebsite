#!/usr/bin/env node
/**
 * KAVARI · Auditoría de imágenes
 * ------------------------------
 * Recorre data/data.json, recopila todas las referencias img/... y las
 * clasifica:
 *   - OK    : el archivo existe y NO es un placeholder SVG KAVARI
 *   - PLACEHOLDER : el archivo existe y es un placeholder SVG KAVARI
 *   - MISSING : el archivo no existe en disco
 *   - WEIRD : extensión rara (no es imagen web conocida)
 *
 * Uso:  node scripts/audit-images.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'data.json');
const IS_OURS = /KAVARI placeholder|&#9992;/;

const IMG_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.jfif', '.svg']);

function isPlaceholderFile(file) {
  try {
    const fd = fs.openSync(file, 'r');
    const buf = Buffer.alloc(512);
    const bytes = fs.readSync(fd, buf, 0, 512, 0);
    fs.closeSync(fd);
    return IS_OURS.test(buf.toString('utf8', 0, bytes));
  } catch (_) {
    return false;
  }
}

const refs = new Map(); // path -> {count, status}
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

function walk(obj, ctry, sec) {
  if (Array.isArray(obj)) { for (const item of obj) walk(item, ctry, sec); return; }
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string' && val.startsWith('img/')) {
      const fp = path.join(ROOT, val.replace(/\//g, path.sep));
      let status;
      if (!fs.existsSync(fp)) status = 'MISSING';
      else if (isPlaceholderFile(fp)) status = 'PLACEHOLDER';
      else {
        const ext = path.extname(val).toLowerCase();
        status = IMG_EXTS.has(ext) ? 'OK' : 'WEIRD';
      }
      if (!refs.has(val)) refs.set(val, { count: 0, status, ctry, sec });
      refs.get(val).count++;
      continue;
    }
    const nextSec = key;
    walk(val, ctry, nextSec);
  }
}

for (const key of Object.keys(data)) {
  if (key === 'top10' || key === 'paquetes') continue;
  walk(data[key], key, '');
}

let ok = 0, ph = 0, miss = 0, weird = 0;
const byCountry = {};
for (const [p, info] of refs) {
  if (info.status === 'OK') ok++;
  else if (info.status === 'PLACEHOLDER') ph++;
  else if (info.status === 'MISSING') miss++;
  else weird++;
  byCountry[info.ctry] = byCountry[info.ctry] || { OK: 0, PLACEHOLDER: 0, MISSING: 0, WEIRD: 0 };
  byCountry[info.ctry][info.status]++;
}

console.log('=== RESUMEN GLOBAL ===');
console.log(`OK: ${ok} | PLACEHOLDER: ${ph} | MISSING: ${miss} | WEIRD: ${weird} | TOTAL refs únicos: ${refs.size}`);
console.log('\n=== POR PAÍS ===');
for (const [c, s] of Object.entries(byCountry).sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(`${c.padEnd(22)} OK:${String(s.OK).padStart(3)}  PH:${String(s.PLACEHOLDER).padStart(3)}  MISSING:${String(s.MISSING).padStart(3)}  WEIRD:${String(s.WEIRD).padStart(3)}`);
}

if (miss > 0 || weird > 0) {
  console.log('\n=== DETALLE MISSING / WEIRD ===');
  for (const [p, info] of refs) {
    if (info.status === 'MISSING' || info.status === 'WEIRD') {
      console.log(`[${info.status}] ${p}`);
    }
  }
}
