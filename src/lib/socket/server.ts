import { SocketServer } from '@/src/pages/api/socket';
import type {
  Server as IOServer,
  ServerOptions as IOServerOptions,
} from 'socket.io';
import { Server } from 'socket.io';

const cachedSocketServer: {
  io: IOServer | null;
} = {
  io: null,
};
export const config = {
  api: {
    bodyParser: false,
  },
};
export const getSocket = (server: SocketServer, opts?: IOServerOptions) => {
  if (cachedSocketServer.io) return cachedSocketServer.io;
  const myOpts = Object.assign(
    {
      transports: ['websocket'],
      cors: {},
      path: '/api/socket',
    },
    opts
  );
  cachedSocketServer.io = new Server(server, myOpts);
  return cachedSocketServer.io;
};
