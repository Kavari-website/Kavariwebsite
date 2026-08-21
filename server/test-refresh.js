const http = require('http');

const req = http.get('http://localhost:3007/api/health', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Respuesta health:', data);
  });
}).on('error', (e) => {
  console.error('Error:', e.message);
});