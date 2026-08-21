const express = require('express');
const { Client } = require('pg');

const app = express();
app.use(express.json());

// Database connection
function getDbClient() {
  return new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'retailhub',
    port: process.env.DB_PORT || 5432
  });
}

app.get('/health', async (req, res) => {
  try {
    const client = getDbClient();
    await client.connect();
    await client.end();
    res.json({status: 'product-service running', database: 'connected'});
  } catch (err) {
    console.error('Database error:', err);
    res.json({status: 'product-service running', database: 'disconnected', error: err.message});
  }
});

app.get('/products', async (req, res) => {
  try {
    const client = getDbClient();
    await client.connect();
    const result = await client.query('SELECT id, name, description, price, stock FROM products ORDER BY id');
    await client.end();
    res.json({products: result.rows});
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({error: err.message, products: []});
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const client = getDbClient();
    await client.connect();
    const result = await client.query('SELECT id, name, description, price, stock FROM products WHERE id = $1', [req.params.id]);
    await client.end();
    if (result.rows.length > 0) {
      res.json({product: result.rows[0]});
    } else {
      res.status(404).json({error: 'Product not found'});
    }
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({error: err.message});
  }
});

app.post('/products', async (req, res) => {
  const {name, description, price, stock} = req.body;
  try {
    const client = getDbClient();
    await client.connect();
    const result = await client.query(
      'INSERT INTO products (name, description, price, stock) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, description, price, stock || 0]
    );
    await client.end();
    res.status(201).json({product_id: result.rows[0].id, name});
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({error: err.message});
  }
});

app.listen(5002, () => console.log('Product service on 5002'));
