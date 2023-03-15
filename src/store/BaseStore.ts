import { create } from "zustand";
import { io } from "socket.io-client";
import { initSocket } from "@/utils/Helpers";
import { nanoid } from "nanoid";
import { useEffect } from "react";
import { devtools } from "zustand/middleware";

type MaybeVideoEl = HTMLVideoElement | null;

interface MainState {
  userId: string;
  socket: ReturnType<typeof io>;
}
type Action = {};
const id = nanoid();
const socket = initSocket(id);
const useMainStore = create<MainState & Action>()((set, get) => {
  return {
    userId: id,
    socket,
  };
});

export { useMainStore };
