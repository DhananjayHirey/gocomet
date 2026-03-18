const io = require('socket.io-client');
const socket = io('http://localhost:3003');

socket.on('connect', () => {
  console.log('Connected');
  socket.emit('subscribe', 1);
});

socket.on('bid_update', (data) => {
  console.log('Received bid update:', JSON.stringify(data));
  process.exit(0);
});
