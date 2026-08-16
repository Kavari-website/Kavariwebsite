// Test the improved chatbot
const { spawn } = require('child_process');
const apiKey = process.env.GCP_API_KEY;
const env = {
  ...process.env,
  GEMINI_API_KEY: apiKey,
  GEMINI_MODEL: 'gemini-1.5-flash'
};
const server = spawn('node', ['index.js'], { cwd: __dirname, env: env, stdio: ['pipe', 'pipe'] });

let serverReady = false;
let geminiStatus = 'unknown';
server.stdout.on('data', (data) => {
  const text = data.toString().trim();
  console.log('SERVER:', text);
  if (text.includes('KAVARI Chat API v3')) serverReady = true;
  if (text.includes('Gemini: ✅')) geminiStatus = 'enabled';
  if (text.includes('Gemini: ❌')) geminiStatus = 'disabled';
});

setTimeout(() => {
  if (serverReady) {
    // Test 1: "qué es KAVARI" - should now respond with general info
    const http = require('http');
    const body1 = JSON.stringify({ 
      message: 'qué es KAVARI', 
      context: { country: null, guias: [], aerolineas: [], hospedajes: [] }, 
      history: [], 
      user: { name: 'Test', plan: null, favorites: [] } 
    });
    const options1 = {
      hostname: 'localhost', port: 3007, path: '/api/chat',
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body1) }
    };
    const req1 = http.request(options1, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('\n--- TEST 1: "¿Qué es KAVARI?" ---');
        console.log('Status:', res.statusCode);
        console.log('Response:', data.substring(0, 300));
        
        // Test 2: "hola" - greeting
        const body2 = JSON.stringify({ message: 'hola', context: { country: null, guias: [], aerolineas: [], hospedajes: [] }, history: [], user: { name: 'Test', plan: null, favorites: [] } });
        const options2 = {
          hostname: 'localhost', port: 3007, path: '/api/chat',
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body2) }
        };
        const req2 = http.request(options2, res2 => {
          let data2 = '';
          res2.on('data', chunk2 => data2 += chunk2);
          res2.on('end', () => {
            console.log('\n--- TEST 2: "Hola" ---');
            console.log('Status:', res2.statusCode);
            console.log('Response:', data2.substring(0, 200));
            
            // Test 3: country question
            const body3 = JSON.stringify({ message: 'cuéntame sobre Argentina', context: { country: { nombre: 'Argentina', code: 'ar' }, guias: [], aerolineas: [], hospedajes: [] }, history: [], user: { name: 'Test', plan: null, favorites: [] } });
            const options3 = {
              hostname: 'localhost', port: 3007, path: '/api/chat',
              method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body3) }
            };
            const req3 = http.request(options3, res3 => {
              let data3 = '';
              res3.on('data', chunk3 => data3 += chunk3);
              res3.on('end', () => {
                console.log('\n--- TEST 3: "Argentina" ---');
                console.log('Status:', res3.statusCode);
                console.log('Response (first 300 chars):', data3.substring(0, 300));
                server.kill();
              });
            });
            req3.write(body3);
            req3.end();
          });
        });
        req2.write(body2);
        req2.end();
      });
    });
    req1.write(body1);
    req1.end();
  } else {
    console.log('Server not ready');
    server.kill();
  }
}, 5000);