import { Socket } from "socket.io-client";
import { StateCreator } from "zustand";
import { AllSliceType } from "./types";

interface MainState {
  userId: string;
  socket: Socket | null;
  setSocket: (sock: Socket) => void;
  setUserId: (id: string) => void;
}
export interface MainSlice extends MainState {}
const createMainSlice: StateCreator<AllSliceType, [], [], MainSlice> = (
  set,
  get
) => {
  return {
    socket: null,
    userId: "",
    setUserId: (id) => {
      set({
        userId: id,
      });
    },
    setSocket: (sock) => {
      set({
        socket: sock || null,
      });
    },
  };
};

export default createMainSlice;
