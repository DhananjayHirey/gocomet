import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../constants/urls';

export const useSocket = (user) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      const s = io(SOCKET_URL);
      setSocket(s);
      return () => s.disconnect();
    }
  }, [user]);

  const subscribeToAuction = (auctionId) => {
    if (socket) {
      socket.emit('subscribe', auctionId);
    }
  };

  return { socket, subscribeToAuction };
};
