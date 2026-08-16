const { spawn } = require('child_process');
const http = require('http');

const child = spawn('node', ['index.js'], { cwd: __dirname, env: { ...process.env, GEMINI_API_KEY: 'AQ.Ab8RN6JQeUAlh3pa-xIH-0VHIR12zO_XaV2h8Kbj7uzcby7esA', GEMINI_MODEL: 'gemini-1.5-flash' }, stdio: ['pipe', 'pipe', 'pipe'] });

let ready = false;
child.stdout.on('data', data => {
  const m = data.toString().trim();
  console.log('SERVER:', m);
  if (m.includes('KAVARI Chat API v3')) ready = true;
});

child.stderr.on('data', data => {
  console.error('ERROR:', data.toString());
});

setTimeout(() => {
  if (ready) {
    // Test 1: "qué es KAVARI"
    testChat('qué es KAVARI', 'Test 1');
    // Test 2: "hola"
    setTimeout(() => testChat('hola', 'Test 2'), 1000);
    // Test 3: "Argentina"
    setTimeout(() => testChat('Argentina', 'Test 3'), 2000);
  } else {
    console.log('Server not ready');
    child.kill();
  }
}, 5000);

function testChat(msg, label) {
  const body = JSON.stringify({ message: msg, context: { country: null, guias: [], aerolineas: [], hospedajes: [] }, history: [], user: { name: 'Test', plan: null, favorites: [] } });
  const options = {
    hostname: 'localhost', port: 3007, path: '/api/chat',
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  };
  const req = http.request(options, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      console.log(`\n--- ${label}: "${msg}" ---`);
      console.log('Status:', res.statusCode);
      console.log('Response:', d.substring(0, 300));
      // Check if it contains "KAVARI es una plataforma"
      if (d.includes('KAVARI es una plataforma') || d.includes('KAVARI is a platform')) {
        console.log('✅ ÉXITO: Respuesta general sobre KAVARI');
      } else if (d.includes('Cartagena') || d.includes('top 10') || d.includes('Según la información')) {
        console.log('⚠️ Muestra información de la base de datos');
      }
    });
  });
  req.on('error', e => console.error('Error:', e.message));
  req.write(body);
  req.end();
}