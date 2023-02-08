import { ChatArray, ChatType } from "@/types";
import { nanoid } from "nanoid";
import { create } from "zustand";

interface MainState {
  messages: ChatArray;
}
type Action = {
  enterChat: (chat: ChatType) => void;
};
const useChatStore = create<MainState & Action>()((set, get) => ({
  messages: [],
  enterChat: (chat) => {
    let id = nanoid();
    set((state) => {
      return {
        messages: [...state.messages, { ...chat, id }],
      };
    });
  },
}));

export { useChatStore };
