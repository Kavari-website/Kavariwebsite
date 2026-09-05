const fs = require('fs');
const path = require('path');

// 1. Extract ES keys from idioma.js
const idiomaText = fs.readFileSync('js/idioma.js', 'utf8');

// Simple approach: find all lines with key: value patterns in es and en sections
function extractKeys(text, sectionName) {
  const keys = [];
  // Find the section
  const sectionRegex = new RegExp(sectionName + ':\\s*\\{');
  const match = sectionRegex.exec(text);
  if (!match) return keys;
  
  let depth = 0;
  let pos = match.index + match[0].length;
  let inString = false;
  let stringChar = '';
  let currentKey = '';
  let expectKey = true;
  
  while (pos < text.length) {
    const ch = text[pos];
    
    if (inString) {
      if (ch === '\\') { pos += 2; continue; }
      if (ch === stringChar) { inString = false; pos++; continue; }
      pos++;
      continue;
    }
    
    if (ch === "'" || ch === '"' || ch === '`') {
      inString = true;
      stringChar = ch;
      pos++;
      continue;
    }
    
    if (ch === '{') { depth++; pos++; continue; }
    if (ch === '}') {
      depth--;
      if (depth < 0) break;
      pos++;
      continue;
    }
    
    // Look for key: pattern (word followed by colon)
    if (depth === 1 && expectKey) {
      const keyMatch = text.slice(pos).match(/^(\w+)\s*:/);
      if (keyMatch) {
        keys.push(keyMatch[1]);
        pos += keyMatch[0].length;
        expectKey = false;
        continue;
      }
    }
    
    if (ch === ',' && depth === 1) {
      expectKey = true;
    }
    
    pos++;
  }
  
  return keys;
}

const esKeys = extractKeys(idiomaText, 'es');
const enKeys = extractKeys(idiomaText, 'en');

// 2. Extract PT keys
const ptText = fs.readFileSync('js/idioma-pt.js', 'utf8');
const ptKeys = extractKeys(ptText, 'pt');

// 3. Extract keys from HTML files
const dir = '.';
const htmlFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
const htmlKeys = new Set();
const htmlPlaceholderKeys = new Set();
const htmlAriaKeys = new Set();

for (const f of htmlFiles) {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  let m;
  const re1 = /data-i18n="([^"]+)"/g;
  while ((m = re1.exec(content)) !== null) htmlKeys.add(m[1]);
  
  const re2 = /data-i18n-placeholder="([^"]+)"/g;
  while ((m = re2.exec(content)) !== null) htmlPlaceholderKeys.add(m[1]);
  
  const re3 = /data-i18n-aria="([^"]+)"/g;
  while ((m = re3.exec(content)) !== null) htmlAriaKeys.add(m[1]);
}

// 4. Extract keys from JS files
const jsKeys = new Set();
function findJs(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules') {
      findJs(path.join(dirPath, e.name));
    } else if (e.isFile() && e.name.endsWith('.js') && !e.name.startsWith('idioma')) {
      const filePath = path.join(dirPath, e.name);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        let m;
        const re = /(?:window\.)?t\(['"]([^'"]+)['"]\)/g;
        while ((m = re.exec(content)) !== null) jsKeys.add(m[1]);
        const re2 = /_t\(['"]([^'"]+)['"]\)/g;
        while ((m = re2.exec(content)) !== null) jsKeys.add(m[1]);
      } catch (e) {}
    }
  }
}
findJs('js');

// Combine all used keys
const allUsedKeys = new Set([...htmlKeys, ...htmlPlaceholderKeys, ...htmlAriaKeys, ...jsKeys]);

console.log('=== KEY COUNTS ===');
console.log('ES keys in idioma.js: ' + esKeys.length);
console.log('EN keys in idioma.js: ' + enKeys.length);
console.log('PT keys in idioma-pt.js: ' + ptKeys.length);
console.log('');
console.log('HTML data-i18n keys: ' + htmlKeys.size);
console.log('HTML data-i18n-placeholder keys: ' + htmlPlaceholderKeys.size);
console.log('HTML data-i18n-aria keys: ' + htmlAriaKeys.size);
console.log('JS t() keys: ' + jsKeys.size);
console.log('Total unique used keys: ' + allUsedKeys.size);

// 5. Find keys used but NOT in ES
const esSet = new Set(esKeys);
const usedNotInES = [...allUsedKeys].filter(k => !esSet.has(k));
console.log('');
console.log('=== USED IN HTML/JS BUT NOT IN ES (' + usedNotInES.length + ') ===');
usedNotInES.sort().forEach(k => console.log('  ' + k));

// 6. Find ES keys not used anywhere
const esNotUsed = esKeys.filter(k => !allUsedKeys.has(k));
console.log('');
console.log('=== ES KEYS NOT USED (' + esNotUsed.length + ') ===');
esNotUsed.sort().forEach(k => console.log('  ' + k));

// 7. Find PT keys not in ES
const ptSet = new Set(ptKeys);
const ptNotInES = [...ptKeys].filter(k => !esSet.has(k));
console.log('');
console.log('=== PT KEYS NOT IN ES (' + ptNotInES.length + ') ===');
ptNotInES.sort().forEach(k => console.log('  ' + k));

// 8. Find ES keys not in PT
const esNotInPT = esKeys.filter(k => !ptSet.has(k));
console.log('');
console.log('=== ES KEYS NOT IN PT (' + esNotInPT.length + ') ===');
esNotInPT.sort().forEach(k => console.log('  ' + k));

// 9. Check for empty values
console.log('');
console.log('=== EMPTY ES VALUES ===');
const emptyEs = esKeys.filter(k => {
  const re = new RegExp(k + '\\s*:\\s*["\']\\s*["\']');
  return re.test(idiomaText);
});
emptyEs.forEach(k => console.log('  ' + k));
if (emptyEs.length === 0) console.log('  (none found)');

// 10. Check ES vs EN identical values (potential untranslated)
console.log('');
console.log('=== ES=EN IDENTICAL VALUES (sample, first 30) ===');
const esVals = {};
const enVals = {};
const esSection = idiomaText.match(/es:\s*\{([\s\S]*?)\n        \},/);
const enSection = idiomaText.match(/en:\s*\{([\s\S]*?)\n        \},/);
if (esSection && enSection) {
  for (const k of esKeys) {
    const re = new RegExp(k + '\\s*:\\s*[\'"`]([^\'"`]+)[\'"`]');
    const m = esSection[1].match(re);
    if (m) esVals[k] = m[1];
  }
  for (const k of enKeys) {
    const re = new RegExp(k + '\\s*:\\s*[\'"`]([^\'"`]+)[\'"`]');
    const m = enSection[1].match(re);
    if (m) enVals[k] = m[1];
  }
  
  const identical = esKeys.filter(k => esVals[k] && enVals[k] && esVals[k] === enVals[k]);
  identical.slice(0, 30).forEach(k => console.log('  ' + k + ': "' + esVals[k] + '"'));
  if (identical.length > 30) console.log('  ... and ' + (identical.length - 30) + ' more');
  if (identical.length === 0) console.log('  (none found)');
}

// 11. Check for destMasiaDios key (suspicious)
console.log('');
console.log('=== SUSPICIOUS KEYS ===');
if (esKeys.includes('destMasiaDios')) console.log('  destMasiaDios exists in ES (possible duplicate of destMarruecos)');
if (ptKeys.includes('destMasiaDios')) console.log('  destMasiaDios exists in PT (possible duplicate of destMarruecos)');

// 12. Check metaDesc keys
console.log('');
console.log('=== METADESC KEYS IN HTML ===');
for (const k of htmlKeys) {
  if (k.startsWith('metaDesc')) {
    console.log('  ' + k + ': in ES=' + esSet.has(k) + ', in PT=' + ptSet.has(k));
  }
}

// 13. Check footerNewsletterPlaceholder
console.log('');
console.log('=== SPECIAL KEY CHECKS ===');
console.log('footerNewsletterPlaceholder: in ES=' + esSet.has('footerNewsletterPlaceholder') + ', in PT=' + ptSet.has('footerNewsletterPlaceholder'));
console.log('footerNewsError: in ES=' + esSet.has('footerNewsError') + ', in PT=' + ptSet.has('footerNewsError'));

// 14. Count per country keys
console.log('');
console.log('=== COUNTRY-SPECIFIC KEY COUNTS ===');
const esCountryKeys = esKeys.filter(k => k.startsWith('pais'));
console.log('ES country-specific keys: ' + esCountryKeys.length);
const ptCountryKeys = ptKeys.filter(k => k.startsWith('pais'));
console.log('PT country-specific keys: ' + ptCountryKeys.length);
