import { useBoundStore } from "@/store";
import { socketPath } from "@/utils/Constants";
import { useState, useEffect } from "react";
import { useStartTyping } from "react-use";
import io from "socket.io-client";
import type { Socket } from "socket.io-client";

export const useSocketClient = () => {
  const userId = useBoundStore((s) => s.userId);
  const socket = useBoundStore((s) => s.socket);
  const setSocket = useBoundStore((s) => s.setSocket);
  const [localSocket, setLocalSocket] = useState<Socket>();
  // useEffect(() => {
  //   if (socket) {
  //     socket.connect();
  //     console.log(`socket status `, socket);
  //   }
  //   const _socket = socket;
  //   return () => {};
  // }, [socket]);

  useEffect(() => {
    const sock = io(socketPath, {
      autoConnect: false,
      transports: ["websocket"],
      auth: {
        userId: "",
      },
    });
    sock.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
    setLocalSocket(sock);
  }, []);

  useEffect(() => {
    if (localSocket) setSocket(localSocket);
  }, [localSocket, setSocket]);

  // useEffect(() => {
  //   if (socket) return;
  //   console.log("hello 123");
  //   if (userId) {
  //     // const controller = new AbortController();
  //     // const signal = controller.signal;
  //     const initSocket = () => {
  //       // await fetch(socketPath, { signal });
  //       const sock = io({
  //         path: socketPath,
  //         autoConnect: false,
  //         transports: ["websocket"],
  //         auth: {
  //           userId,
  //         },
  //       });
  //       setSocket(sock);
  //       sock.connect();
  //       const _socket = sock;
  //       return () => {
  //         if (_socket && _socket.connected) {
  //           _socket.disconnect();
  //         }
  //       };
  //     };
  //     return initSocket();

  //     // return () => {
  //     //   controller.abort();
  //     // };
  //   }
  // }, [userId, setSocket, socket]);
  return socket;
};
