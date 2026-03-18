const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();
const bidRoutes = require('./routes/bidRoutes');
const socketHandler = require('./socket/socketHandler');
const { initKafka } = require('./kafka');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use('/', bidRoutes);

socketHandler.init(server);
initKafka();

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log(`Bidding Service running on port ${PORT}`);
});
