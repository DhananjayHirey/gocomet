const express = require('express');
const cors = require('cors');
require('dotenv').config();
const auctionRoutes = require('./routes/auctionRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', auctionRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Auction Service running on port ${PORT}`);
});
