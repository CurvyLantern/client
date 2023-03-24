import { initSocketClient } from "@/utils/SocketHelpers";
import { nanoid } from "nanoid";
import { Socket } from "socket.io-client";
import { StateCreator } from "zustand";
import { AllSliceType } from "./types";

interface MainState {
  userId: string;
  socket: Socket;
}
export interface MainSlice extends MainState {}

const userId = nanoid();
const createMainSlice: StateCreator<AllSliceType, [], [], MainSlice> = () => {
  return {
    socket: initSocketClient(userId),
    userId,
  };
};

export default createMainSlice;
