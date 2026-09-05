const fs = require('fs');
const path = require('path');

// Better approach: extract keys using line-by-line parsing
function extractKeysFromLine(text, sectionMarker) {
  const keys = [];
  const lines = text.split('\n');
  let inSection = false;
  let depth = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Detect section start
    if (!inSection && trimmed.startsWith(sectionMarker + ':')) {
      inSection = true;
      depth = 0;
    }
    
    if (!inSection) continue;
    
    // Count braces
    for (const ch of trimmed) {
      if (ch === '{') depth++;
      if (ch === '}') depth--;
    }
    
    if (depth <= 0 && inSection && trimmed.startsWith('}')) {
      // End of section
      break;
    }
    
    // Extract key: value pairs
    const m = trimmed.match(/^(\w+)\s*:\s*['"`]/);
    if (m && depth >= 1) {
      keys.push(m[1]);
    }
    // Also match without quotes (booleans, numbers)
    const m2 = trimmed.match(/^(\w+)\s*:\s*[0-9]/);
    if (m2 && depth >= 1) {
      keys.push(m2[1]);
    }
  }
  
  return keys;
}

const idiomaText = fs.readFileSync('js/idioma.js', 'utf8');
const esKeys = extractKeysFromLine(idiomaText, 'es');
const enKeys = extractKeysFromLine(idiomaText, 'en');

const ptText = fs.readFileSync('js/idioma-pt.js', 'utf8');
const ptKeys = extractKeysFromLine(ptText, 'pt');

console.log('=== KEY COUNTS ===');
console.log('ES keys in idioma.js: ' + esKeys.length);
console.log('EN keys in idioma.js: ' + enKeys.length);
console.log('PT keys in idioma-pt.js: ' + ptKeys.length);

// Country-specific counts
const esCountryKeys = esKeys.filter(k => k.startsWith('pais'));
const ptCountryKeys = ptKeys.filter(k => k.startsWith('pais'));
console.log('ES country-specific keys: ' + esCountryKeys.length);
console.log('PT country-specific keys: ' + ptCountryKeys.length);
console.log('');

// HTML keys
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

// JS keys
const jsKeys = new Set();
function findJs(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules' && e.name !== 'scripts') {
      findJs(path.join(dirPath, e.name));
    } else if (e.isFile() && e.name.endsWith('.js') && !e.name.startsWith('idioma')) {
      try {
        const content = fs.readFileSync(path.join(dirPath, e.name), 'utf8');
        let m;
        // Match t('key') and _t('key') patterns
        const re = /(?:window\.)?t\(['"]([^'"]+)['"]\)/g;
        while ((m = re.exec(content)) !== null) jsKeys.add(m[1]);
        const re2 = /_t\(['"]([^'"]+)['"]\)/g;
        while ((m = re2.exec(content)) !== null) jsKeys.add(m[1]);
        // Match template literal uses: ${t('key')}
        const re3 = /\$\{(?:window\.)?t\(['"]([^'"]+)['"]\)\}/g;
        while ((m = re3.exec(content)) !== null) jsKeys.add(m[1]);
      } catch (e) {}
    }
  }
}
findJs('js');

// Filter out non-key matches from jsKeys (CSS selectors, etc.)
const validJSLen = jsKeys.size;
const filteredJSKeys = new Set([...jsKeys].filter(k => {
  // Must look like a translation key (camelCase or snake_case, not CSS selectors)
  return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(k) && !k.startsWith('.') && k.length > 2;
}));

console.log('=== HTML/JS KEY COUNTS ===');
console.log('HTML data-i18n keys: ' + htmlKeys.size);
console.log('HTML data-i18n-placeholder keys: ' + htmlPlaceholderKeys.size);
console.log('HTML data-i18n-aria keys: ' + htmlAriaKeys.size);
console.log('JS t() keys (raw): ' + validJSLen);
console.log('JS t() keys (filtered): ' + filteredJSKeys.size);

const allUsedKeys = new Set([...htmlKeys, ...htmlPlaceholderKeys, ...htmlAriaKeys, ...filteredJSKeys]);
console.log('Total unique used keys: ' + allUsedKeys.size);

// Cross-reference
const esSet = new Set(esKeys);
const enSet = new Set(enKeys);
const ptSet = new Set(ptKeys);

// Keys used but NOT in ES
const usedNotInES = [...allUsedKeys].filter(k => !esSet.has(k));
console.log('');
console.log('=== KEYS USED IN HTML/JS BUT NOT DEFINED IN ES (' + usedNotInES.length + ') ===');
usedNotInES.sort().forEach(k => console.log('  ' + k));

// ES keys not used anywhere
const esNotUsed = esKeys.filter(k => !allUsedKeys.has(k));
console.log('');
console.log('=== ES KEYS NOT USED IN HTML OR JS (' + esNotUsed.length + ') ===');
esNotUsed.sort().forEach(k => console.log('  ' + k));

// PT keys not in ES
const ptNotInES = [...ptKeys].filter(k => !esSet.has(k));
console.log('');
console.log('=== PT KEYS NOT IN ES (' + ptNotInES.length + ') ===');
ptNotInES.sort().forEach(k => console.log('  ' + k));

// ES keys not in PT
const esNotInPT = esKeys.filter(k => !ptSet.has(k));
console.log('');
console.log('=== ES KEYS NOT IN PT (' + esNotInPT.length + ') ===');
esNotInPT.sort().forEach(k => console.log('  ' + k));

// ES keys not in EN
const esNotInEN = esKeys.filter(k => !enSet.has(k));
console.log('');
console.log('=== ES KEYS NOT IN EN (' + esNotInEN.length + ') ===');
esNotInEN.sort().forEach(k => console.log('  ' + k));

// EN keys not in ES
const enNotInES = enKeys.filter(k => !esSet.has(k));
console.log('');
console.log('=== EN KEYS NOT IN ES (' + enNotInES.length + ') ===');
enNotInES.sort().forEach(k => console.log('  ' + k));

// metaDesc check
console.log('');
console.log('=== METADESC KEY COVERAGE ===');
const metaDescKeys = [...htmlKeys].filter(k => k.startsWith('metaDesc'));
for (const k of metaDescKeys) {
  console.log('  ' + k + ': ES=' + esSet.has(k) + ' EN=' + enSet.has(k) + ' PT=' + ptSet.has(k));
}

// footerNewsletterPlaceholder check
console.log('');
console.log('=== SPECIAL KEY CHECKS ===');
const specialKeys = ['footerNewsletterPlaceholder', 'footerNewsError', 'ariaMiCuenta', 'footerLegalTitle', 'footerSoporteTitle', 'heroMiniDestinos', 'heroMiniGuias', 'heroMiniValoracion', 'footerLinkAyuda', 'footerLinkPlanes', 'footerLinkPrivacidad', 'footerLinkTerminos', 'footerNewsletterBtn', 'footerNewsletterDesc', 'footerNewsletterTitle', 'perfilEliminando', 'perfilEliminarCuentaConfirm', 'perfilEliminarCuentaError', 'perfilEliminarCuentaExito'];
for (const k of specialKeys) {
  const inHTML = htmlKeys.has(k) || htmlPlaceholderKeys.has(k) || htmlAriaKeys.has(k);
  const inJS = filteredJSKeys.has(k);
  console.log('  ' + k + ': HTML=' + inHTML + ' JS=' + inJS + ' ES=' + esSet.has(k) + ' PT=' + ptSet.has(k));
}
