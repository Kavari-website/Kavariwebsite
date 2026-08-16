// Start the server
const { spawn } = require('child_process');
const server = spawn('node', ['index.js'], { cwd: __dirname, stdio: ['pipe', 'pipe'] });

let serverReady = false;
server.stdout.on('data', (data) => {
  console.log('SERVER:', data.toString());
  if (data.toString().includes('KAVARI Chat API v3')) serverReady = true;
});

server.stderr.on('data', (data) => {
  console.error('SERVER ERROR:', data.toString());
});

setTimeout(() => {
  if (serverReady) {
    // Test the API
    const http = require('http');
    const body = JSON.stringify({ message: 'hola' });
    const options = {
      hostname: 'localhost',
      port: 3007,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('API Status:', res.statusCode);
        console.log('API Response:', data);
        server.kill();
      });
    });
    req.on('error', e => {
      console.error('API Error:', e.message);
      server.kill();
    });
    req.write(body);
    req.end();
  } else {
    console.log('Server not ready in time');
    server.kill();
  }
}, 5000);