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
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', e => {
  console.error('Error:', e.message);
});

req.write(body);
req.end();