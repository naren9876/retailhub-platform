const express = require('express');
const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({status: 'product-service running'}));
app.get('/products', (req, res) => res.json({products: []}));
app.post('/products', (req, res) => {
  const product_id = `prod-${Date.now()}`;
  res.json({product_id, name: req.body.name}, 201);
});
app.listen(5002, () => console.log('Product service on 5002'));
