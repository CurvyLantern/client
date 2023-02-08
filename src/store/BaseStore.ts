import { create } from "zustand";
import { io } from "socket.io-client";
import { initSocket } from "@/utils/Helpers";
import { nanoid } from "nanoid";
import { useEffect } from "react";
import { devtools } from "zustand/middleware";

type MaybeVideoEl = HTMLVideoElement | null;
type UserVideoMapType = Map<string, MaybeVideoEl>;

interface MainState {
  userId: string;
  socket: ReturnType<typeof io> | null;
}
type Action = {};
const userId = nanoid();
const useMainStore = create<MainState & Action>()((set) => ({
  userId,
  socket: initSocket(userId),
}));



export { useMainStore };
