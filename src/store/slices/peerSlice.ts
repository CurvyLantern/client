import type { Instance } from "simple-peer";
import { StateCreator } from "zustand";
import { AllSliceType } from "./types";

type MaybePeer = Instance | null;
type PeerMapType = Map<string, MaybePeer>;
interface MainState {
  peerMap: PeerMapType;
}
interface Action {
  addPeer: (id: string, peer: MaybePeer) => void;
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
