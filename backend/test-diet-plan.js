import http from 'http';

const testDietPlan = () => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTMxZDBiZjZhYTRiZGZkMjgxYWIzNzQiLCJlbWFpbCI6InplZXNoYW5hc2doYXIxNTAyQGdtYWlsLmNvbSIsImlhdCI6MTczNTMxODAwMH0.aBcDeFgHiJkLmNoPqRsT';
  const body = JSON.stringify({ target_date: '2025-12-16' });
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/diet-plan/generate',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`✅ Success! Status: ${res.statusCode}`);
      try {
        const parsed = JSON.parse(data);
        console.log('Response:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Response (raw):', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });

  req.write(body);
  req.end();
};

testDietPlan();
