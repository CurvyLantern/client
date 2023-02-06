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
  userData: UserVideoMapType;
}
type Action = {
  setUserData: (id: string, el: MaybeVideoEl) => void;
  mergeUserData: (id: string) => void;
  clearUser: (id: string) => void;
  clearAllUser: () => void;
};
const userId = nanoid();
const useMainStore = create<MainState & Action>()(
  devtools(
    (set, get) => ({
      userId,
      socket: initSocket(userId),
      userData: new Map(),
      setUserData: (id, el) =>
        set((state) => ({
          userData: new Map(state.userData).set(id, el),
        })),
      mergeUserData: (id) => {
        if (get().userData.has(id)) return;
        set((state) => ({
          userData: new Map(state.userData).set(id, null),
        }));
      },
      clearUser: (id) =>
        set((state) => {
          const temp = new Map(state.userData);
          temp.delete(id);
          return {
            userData: new Map(temp),
          };
        }),

      clearAllUser: () => {
        set((state) => ({ userData: new Map() }));
      },
    }),
    {
      name: "devtools",
      store: "Main store",
    }
  )
);

export { useMainStore };
