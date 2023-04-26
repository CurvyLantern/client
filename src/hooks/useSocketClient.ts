import { useBoundStore } from "@/store";
import { socketPath } from "@/utils/Constants";
import { useEffect } from "react";
import io from "socket.io-client";

export const useSocketClient = () => {
  const userId = useBoundStore((s) => s.userId);
  const socket = useBoundStore((s) => s.socket);
  const setSocket = useBoundStore((s) => s.setSocket);

  useEffect(() => {
    if (socket) {
      if (socket.disconnected) {
        socket.connect();
      }
    }
    return () => {
      if (socket && socket.connected) {
        socket.disconnect();
      }
    };
  }, [socket]);

  useEffect(() => {
    if (userId) {
      console.log("hey there 25 useSocketClient");
      const controller = new AbortController();
      const signal = controller.signal;
      const socketInitializer = async () => {
        try {
          await fetch(socketPath, { signal });
          const sock = io({
            path: socketPath,
            autoConnect: true,
            transports: ["websocket"],
            auth: {
              userId,
            },
          });
          setSocket(sock);
        } catch (err) {
          console.error(err);
        }
      };
      socketInitializer();

      return () => {
        controller.abort();
      };
    }
  }, [userId, setSocket]);
  return socket;
};
