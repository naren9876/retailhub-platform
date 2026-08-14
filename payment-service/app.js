const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'payment-service running' });
});

app.post('/pay', (req, res) => {
  res.json({ success: true, transaction_id: '12345' });
});

app.listen(5004, '0.0.0.0', () => {
  console.log('Payment service running on port 5004');
});
