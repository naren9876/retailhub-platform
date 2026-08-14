const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'loyalty-service running' });
});

app.post('/award-points', (req, res) => {
  res.json({ points_awarded: 100 });
});

app.listen(5006, '0.0.0.0', () => {
  console.log('Loyalty service running on port 5006');
});
