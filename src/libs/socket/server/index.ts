import { connectToDatabase } from "@/libs/database";
import Room from "@/libs/database/room/model";
import type { SocketServer } from "@/pages/api/socket";
import { socketPath } from "@/utils/Constants";
import { socketEvents } from "@/utils/SocketHelpers";
import type {
  Server as IOServer,
  ServerOptions as IOServerOptions,
  Socket as ISocket,
} from "socket.io";
import { Server } from "socket.io";

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
interface SocketWithUserId extends ISocket {
  userId?: string;
}
export const getSocket = (server: SocketServer, opts?: IOServerOptions) => {
  // if (cachedSocketServer.io) return cachedSocketServer.io;
  const myOpts = Object.assign(
    {
      transports: ["websocket"],
      cors: {},
      // path: socketPath,
    },
    opts
  );
  const io = new Server(server, myOpts);

  io.use((socket: SocketWithUserId, next) => {
    const userId = socket.handshake.auth.userId;
    socket.userId = typeof userId === "string" ? userId : "";
    next();
  });

  io.on("connection", (socket: SocketWithUserId) => {
    console.log(" hello I am from socket ");

    // Join Room
    socket.on(socketEvents.join, (roomId) => {
      console.log("user joined", roomId);
      // join the room
      socket.join(roomId);
      socket.emit(socketEvents.joined, roomId);
      // notify everyone else that you have joined
      socket.to(roomId).emit(socketEvents.friendJoined, {
        whoJoinedId: socket.userId,
        whoJoinedSockId: socket.id,
      });
    });

    socket.on(socketEvents.receive, ({ toWhomId, toWhomSockId, roomId }) => {
      if (toWhomSockId) {
        io.to(toWhomSockId).emit(socketEvents.receive, {
          fromWhomId: socket.handshake.auth.userId,
          fromWhomSockId: socket.id,
        });
      } else {
        (async () => {
          const sockMap = await io.in(roomId).fetchSockets();
          for (let sock of sockMap) {
            if (sock.handshake.auth.userId === toWhomId) {
              io.to(sock.id).emit(socketEvents.receive, {
                fromWhomId: socket.handshake.auth.userId,
                fromWhomSockId: socket.id,
              });
              break;
            }
          }
        })();
      }
    });

    //complete don't touch
    socket.on(
      socketEvents.sendSignal,
      ({ toWhomId, toWhomSockId, signal, roomId }) => {
        if (toWhomSockId) {
          io.to(toWhomSockId).emit(socketEvents.receiveSignal, {
            fromWhomId: socket.userId,
            fromWhomSockId: socket.id,
            signal,
          });
        } else {
          (async () => {
            const sockMap = await io.in(roomId).fetchSockets();
            for (let sock of sockMap) {
              if (sock.handshake.auth.userId === toWhomId) {
                io.to(sock.id).emit(socketEvents.receiveSignal, {
                  fromWhomId: socket.userId,
                  fromWhomSockId: socket.id,
                  signal,
                });
                break;
              }
            }
          })();
        }
      }
    );

    console.log("I am connected and working", socket.handshake.auth.userId);

    socket.on("logging-out", ({ roomId }) => {
      socket
        .to(roomId)
        .emit(socketEvents.friendLogout, { who: socket.handshake.auth.userId });
      console.log("logging out ", socket.handshake.auth.userId);
    });

    socket.on("send-message", ({ roomId, ...data }) => {
      console.log(data, roomId);
      io.to(roomId).emit("receive-message", data);
    });

    socket.on(socketEvents.askPermission, ({ roomId }) => {
      (async () => {
        await connectToDatabase();
        const author = await Room.findOne({
          roomId,
        })
          .select("authorId")
          .lean();
        console.log(author, " from socket ");

        const sockets = await io.in(roomId).fetchSockets();
        // console.log(sockets, " sockets ");
        const authorSocket = sockets.find((sock) => {
          const state =
            (sock as unknown as { userId: string }).userId === author.authorId;
          return state;
        });
        if (authorSocket) {
          console.log(" autorSocketid ", authorSocket.id);
          io.to(authorSocket.id).emit(socketEvents.grantPermission, {
            socketId: socket.id,
            userId: socket.userId,
          });
        }
      })();
    });

    socket.on(
      socketEvents.permissionGranted,
      ({ socketId, userId, roomId }) => {
        console.log(" permission has been given to you ");
        (async () => {
          try {
            await Room.updateOne(
              { roomId },
              { $addToSet: { members: userId } }
            );
            io.to(socketId).emit(socketEvents.permissionGranted, {});
          } catch (e) {
            throw e;
          }
        })();
      }
    );

    socket.on("disconnect", (reason) => {
      const id = socket.id;
      const allRooms = socket.rooms;
      console.log({ disconnected: reason });
    });
  });

  // cachedSocketServer.io = io;

  return io;
};
