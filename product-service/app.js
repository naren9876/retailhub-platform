const express = require('express');
const { Client } = require('pg');

const app = express();
app.use(express.json());

let dbClient = null;

// Lazy database connection - connect only when needed
async function getDbConnection() {
  if (!dbClient || !dbClient.queryQueue) {
    dbClient = new Client({
      host: process.env.DB_HOST,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'retailhub',
      port: process.env.DB_PORT || 5432,
      connectionTimeoutMillis: 5000,
      statement_timeout: 5000
    });
    try {
      await dbClient.connect();
    } catch (err) {
      console.error('DB connection error:', err);
      dbClient = null;
      throw err;
    }
  }
  return dbClient;
}

// Health check - fast response, optional DB check
app.get('/health', (req, res) => {
  res.json({status: 'product-service running'});
});

app.get('/products', async (req, res) => {
  try {
    const client = await getDbConnection();
    const result = await client.query('SELECT id, name, description, price, stock FROM products ORDER BY id LIMIT 100');
    res.json({products: result.rows});
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({error: err.message, products: []});
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const client = await getDbConnection();
    const result = await client.query('SELECT id, name, description, price, stock FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length > 0) {
      res.json({product: result.rows[0]});
    } else {
      res.status(404).json({error: 'Product not found'});
    }
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

app.post('/products', async (req, res) => {
  const {name, description, price, stock} = req.body;
  try {
    const client = await getDbConnection();
    const result = await client.query(
      'INSERT INTO products (name, description, price, stock) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, description, price, stock || 0]
    );
    res.status(201).json({product_id: result.rows[0].id, name});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

app.listen(5002, () => console.log('Product service on 5002'));
