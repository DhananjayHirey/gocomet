const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const AUCTION_SERVICE_URL = process.env.AUCTION_SERVICE_URL || 'http://auction-service:3002';
const BIDDING_SERVICE_URL = process.env.BIDDING_SERVICE_URL || 'http://bidding-service:3003';


app.get('/health', (req, res) => res.json({ status: 'Gateway OK' }));


app.use('/auth', createProxyMiddleware({
  target: AUTH_SERVICE_URL,
  changeOrigin: true,
}));

app.use('/auction', createProxyMiddleware({
  target: AUCTION_SERVICE_URL,
  changeOrigin: true,
}));

app.use('/bid', createProxyMiddleware({
  target: BIDDING_SERVICE_URL,
  changeOrigin: true,
}));


app.use('/socket.io', createProxyMiddleware({
  target: BIDDING_SERVICE_URL,
  changeOrigin: true,
  ws: true,
}));

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
