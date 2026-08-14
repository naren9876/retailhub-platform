const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'product-service running' });
});

app.get('/products', (req, res) => {
  res.json({ products: [] });
});

app.listen(5002, '0.0.0.0', () => {
  console.log('Product service running on port 5002');
});
