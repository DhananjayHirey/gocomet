const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { initKafkaProducer, sendBidUpdate } = require('./kafka');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const AUCTION_SERVICE_URL = process.env.AUCTION_SERVICE_URL || 'http://auction-service:3002';
const BIDDING_SERVICE_URL = process.env.BIDDING_SERVICE_URL || 'http://bidding-service:3003';
const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret';

app.get('/health', (req, res) => res.json({ status: 'Gateway OK' }));


app.use('/auth', createProxyMiddleware({
  target: AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/auth': '' },
}));

app.use('/auction', createProxyMiddleware({
  target: AUCTION_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/auction': '' },
}));


app.post('/bid', express.json(), async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { auction_id, price } = req.body;

    if (!auction_id || !price) {
      return res.status(400).json({ message: 'auction_id and price are required' });
    }

    await sendBidUpdate({ auction_id, price, supplier_id: decoded.id });
    res.status(202).json({ message: 'Bid placement initiated' });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});


app.use('/bid', createProxyMiddleware({
  target: BIDDING_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/bid': '' },
}));

app.use('/socket.io', createProxyMiddleware({
  target: BIDDING_SERVICE_URL,
  changeOrigin: true,
  ws: true,
}));

app.listen(PORT, async () => {
  await initKafkaProducer();
  console.log(`API Gateway running on port ${PORT}`);
});
