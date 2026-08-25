const fs = require('fs');
let c = fs.readFileSync('C:\\Users\\Estudiante A2-04\\Downloads\\Kavari\\Kavari\\data\\data.json','utf8');
// Find the conflict markers
const startIdx = c.indexOf('<<<<<<<');
const middleIdx = c.indexOf('=======');
const endIdx = c.indexOf('>>>>>>>');

// Remove lines from <<<<<<< to >>>>>>>
if (startIdx !== -1 && middleIdx !== -1 && endIdx !== -1) {
  // Keep everything before start, and everything after end
  c = c.slice(0, startIdx) + c.slice(endIdx + '>>>>>>>'.length);
  console.log('Removed conflict, new length:', c.length);
} else {
  console.log('Start:', startIdx, 'Middle:', middleIdx, 'End:', endIdx);
}

// Now try to parse
try {
  const d = JSON.parse(c);
  console.log('JSON is valid!');
  console.log('Country codes sample:', Object.keys(d).filter(k => k !== 'top10' && k !== 'paquetes').join(', ').slice(0, 200).substring(0, 200));
} catch(e) {
  console.error('Still error:', e.message);
  console.error('Position:', e.column);
  // Show context around error
  const errPos = e.column;
  console.error('Context:', c.slice(errPos-20, errPos+20));
}

// Write fixed file
fs.writeFileSync('C:\\Users\\Estudiante A2-04\\Downloads\\Kavari\\Kavari\\data\\data.fixed.json', c);
console.log('Fixed file written to data.fixed.json');