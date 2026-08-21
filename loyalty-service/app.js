const express = require('express');
const { Client } = require('pg');
const app = express();
app.use(express.json());

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
    res.json({status: 'loyalty-service running', database: 'connected'});
  } catch (err) {
    res.json({status: 'loyalty-service running', database: 'disconnected', error: err.message});
  }
});

app.get('/loyalty', async (req, res) => {
  try {
    const client = getDbClient();
    await client.connect();
    const result = await client.query('SELECT * FROM loyalty_points ORDER BY id DESC LIMIT 10');
    await client.end();
    res.json({loyalty_data: result.rows});
  } catch (err) {
    res.status(500).json({error: err.message, loyalty_data: []});
  }
});

app.listen(5006, () => console.log('Loyalty service on 5006'));
