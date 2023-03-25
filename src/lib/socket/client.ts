import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import io from 'socket.io-client';

export const useSocketClient = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => {
    const socketInitializer = async () => {
      await fetch('/api/socket');
      const sock = io({
        path: '/api/socket',
        autoConnect: false,
        transports: ['websocket'],
      });
      setSocket(sock);
    };
    socketInitializer();
  }, []);
  return [socket];
};
