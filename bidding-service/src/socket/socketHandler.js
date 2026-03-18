const { Server } = require('socket.io');

let io;

const init = (server) => {
  io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('subscribe', (auctionId) => {
      socket.join(`auction:${auctionId}`);
      console.log(`Socket ${socket.id} subscribed to auction:${auctionId}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { init, getIO };
