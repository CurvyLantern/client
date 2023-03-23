import { ChatArray, ChatType } from "@/types";
import { nanoid } from "nanoid";
import { StateCreator } from "zustand";
import { AllSliceType } from "./types";

interface MainState {
  messages: ChatArray;
}
interface Action {
  enterChat: (chat: ChatType) => void;
}
export interface ChatSlice extends MainState, Action {}
const createChatSlice: StateCreator<AllSliceType, [], [], ChatSlice> = (
  set,
  get
) => ({
  messages: [],
  enterChat: (chat) => {
    let id = nanoid();
    set((state) => {
      return {
        messages: [...state.messages, { ...chat, id }],
      };
    });
  },
});

export default createChatSlice;
