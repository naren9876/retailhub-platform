const express = require('express');
const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({status: 'payment-service running'}));
app.get('/payments', (req, res) => res.json({payments: []}));
app.post('/process', (req, res) => res.json({status: 'completed'}));
app.listen(5004, () => console.log('Payment service on 5004'));
