import { initSocket } from "@/utils/Helpers";
import { nanoid } from "nanoid";
import { io } from "socket.io-client";
import { StateCreator } from "zustand";
import { AllSliceType } from "./types";

type MaybeSocket = ReturnType<typeof io> | null;
interface MainState {
  userId: string;
  socket: MaybeSocket;
}
interface Action {
  initUserId: (id?: string) => void;
  addSocket: (socket: MaybeSocket) => void;
}

export interface MainSlice extends MainState, Action {}

const initialState: MainState = {
  userId: "",
  socket: null,
};
const createMainSlice: StateCreator<AllSliceType, [], [], MainSlice> = (
  set,
  get
) => ({
  ...initialState,
  initUserId: (id) => {
    set({
      userId: id ? id : nanoid(),
    });
  },
  addSocket: (socket) => {
    set({
      socket: socket ? socket : initSocket(get().userId),
    });
  },
});

export default createMainSlice;
