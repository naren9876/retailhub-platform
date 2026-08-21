const express = require('express');
const { Client } = require('pg');

const app = express();
app.use(express.json());

let dbClient = null;

async function getDbConnection() {
  if (!dbClient || !dbClient.queryQueue) {
    dbClient = new Client({
      host: process.env.DB_HOST,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'retailhub',
      port: process.env.DB_PORT || 5432,
      connectionTimeoutMillis: 5000
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

app.get('/health', (req, res) => {
  res.json({status: 'loyalty-service running'});
});

app.get('/loyalty', async (req, res) => {
  try {
    const client = await getDbConnection();
    const result = await client.query('SELECT * FROM loyalty_points ORDER BY id DESC LIMIT 100');
    res.json({loyalty_data: result.rows});
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({error: err.message, loyalty_data: []});
  }
});

app.listen(5006, () => console.log('Loyalty service on 5006'));
