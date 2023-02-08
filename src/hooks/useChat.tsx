import { useMainStore } from "@/store/BaseStore";
import { useChatStore } from "@/store/ChatStore";
import { usePeerStore } from "@/store/PeerStore";
import { ChatType } from "@/types";
import { useEffect } from "react";

const useChat = (roomId: string) => {
  const socket = useMainStore((state) => state.socket);
  const enterChat = useChatStore((state) => state.enterChat);
  useEffect(() => {
    if (!socket) return;
    socket.on("receive-message", (option: ChatType) => {
      enterChat(option);
    });
  }, []);
  const sendMessage = (option: ChatType) => {
    console.log("sending message", socket);
    socket?.emit("send-message", { ...option, roomId });
  };
  return { sendMessage };
};

export { useChat };
