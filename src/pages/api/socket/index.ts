import { getSocket } from '@/lib/socket/server';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Server as IOServer } from 'socket.io';

export interface SocketServer extends HTTPServer {
  io: IOServer | null;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  try {
    const server = res.socket.server;
    if (!server) {
      console.log("why isn't there any server");
    }
    if (server.io) {
      console.log('reusing old socket');
    } else {
      const io = getSocket(server);
      server.io = io;
      io.on('connection', socket => {
        socket.on('send-msg', data => {
          socket.broadcast.emit('receive-msg', data);
        });
      });
    }
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'server error' });
    res.end();
  }
}
