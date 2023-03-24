import { useBoundStore } from "@/store";
import { ChatType } from "@/types";
import { useEffect } from "react";

const useChat = (roomId: string) => {
  const socket = useBoundStore((state) => state.socket);
  const enterChat = useBoundStore((state) => state.enterChat);
  useEffect(() => {
    if (!socket) return;
    const handler = (option: ChatType) => {
      enterChat(option);
    };
    socket.on("receive-message", handler);
    return () => {
      socket.off("receive-message", handler);
    };
  }, [socket, enterChat]);
  const sendMessage = (option: ChatType) => {
    console.log("sending message", socket);
    socket?.emit("send-message", { ...option, roomId });
  };
  return { sendMessage };
};

export { useChat };
