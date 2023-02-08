import { initSocket } from "@/utils/Helpers";
import { nanoid } from "nanoid";
import SimplePeer from "simple-peer";
import { io } from "socket.io-client";
import { create } from "zustand";

type MaybeVideoEl = HTMLVideoElement | null;
type MaybePeer = SimplePeer.Instance | null;
type PeerDataType = {
  peer?: MaybePeer;
  videoEl?: MaybeVideoEl;
  used?: boolean;
};
type PeerMapType = Map<string, PeerDataType>;
interface MainState {
  peerData: PeerMapType;
}
type Action = {
  initPeerData: (id: string, peer: MaybePeer, el: MaybeVideoEl) => void;
  setPeerToUser?: (id: string, peer: MaybePeer) => void;
  setVideoElToUser: (id: string, el: MaybeVideoEl) => void;
  clearUser: (id: string) => boolean;
  clearAllUser: () => void;
};
const userId = nanoid();
const usePeerStore = create<MainState & Action>()((set, get) => ({
  peerData: new Map(),
  initPeerData: (id, peer, el) => {
    set((state) => {
      return {
        peerData: new Map(get().peerData).set(id, {
          peer,
          videoEl: el,
          used: false,
        }),
      };
    });
  },
  setVideoElToUser: (id, el) => {
    set((state) => {
      const data = state.peerData.get(id);
      return {
        peerData: new Map(state.peerData).set(id, {
          ...data,
          videoEl: el,
        }),
      };
    });
  },
  clearUser: (id) => {
    let deleted = false;
    set((state) => {
      const temp = new Map(state.peerData);
      deleted = temp.delete(id);
      return {
        peerData: new Map(temp),
      };
    });
    return deleted;
  },
  clearAllUser: () => {
    get().peerData.forEach((obj: any) => {
      obj.peer?.destroy();
      obj.videoEl?.srcObject ? (obj.videoEl.srcObject = null) : null;
    });
    set(() => ({
      peerData: new Map(),
    }));
  },
}));

export { usePeerStore };
