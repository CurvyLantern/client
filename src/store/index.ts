import { create } from "zustand";
import createChatSlice from "./slices/chatSlice";
import createMainSlice from "./slices/mainSlice";
import createPeerSlice from "./slices/peerSlice";
import { AllSliceType } from "./slices/types";

const useBoundStore = create<AllSliceType>()((...a) => ({
  ...createMainSlice(...a),
  ...createPeerSlice(...a),
  ...createChatSlice(...a),
}));

export default useBoundStore;
