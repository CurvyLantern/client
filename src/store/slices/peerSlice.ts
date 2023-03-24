import type { Instance } from "simple-peer";
import { StateCreator } from "zustand";
import { AllSliceType } from "./types";

type PeerMapType = Map<string, Instance>;
interface MainState {
  peerMap: PeerMapType;
}
interface Action {
  addPeer: (id: string, peer: Instance) => void;
  removePeer: (id: string) => void;
  removeAll: () => void;
}

export interface PeerSlice extends MainState, Action {}

const initialState: MainState = {
  peerMap: new Map(),
};
const createPeerSlice: StateCreator<AllSliceType, [], [], PeerSlice> = (
  set,
  get
) => ({
  ...initialState,
  addPeer: (id, peer) => {
    if (!peer) return;
    set({
      peerMap: new Map(get().peerMap).set(id, peer),
    });
  },
  removePeer: (id) => {
    const map = new Map(get().peerMap);
    map.delete(id);
    set({
      peerMap: map,
    });
  },
  removeAll: () => {
    set(initialState);
  },
});

export default createPeerSlice;
