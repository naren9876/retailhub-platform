const express = require('express');
const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({status: 'loyalty-service running'}));
app.get('/loyalty/:id', (req, res) => res.json({customer_id: req.params.id, points: 0}));
app.post('/loyalty/:id/add-points', (req, res) => {
  res.json({customer_id: req.params.id, points_added: req.body.points}, 201);
});
app.listen(5006, () => console.log('Loyalty service on 5006'));
