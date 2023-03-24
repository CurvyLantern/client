import { create } from "zustand";
import { shallow } from "zustand/shallow";
import createChatSlice from "./slices/chatSlice";
import createMainSlice from "./slices/mainSlice";
import createPeerSlice from "./slices/peerSlice";
import createStreamSlice from "./slices/streamSlice";
import { AllSliceType } from "./slices/types";

export const useBoundStore = create<AllSliceType>()((...a) => ({
  ...createMainSlice(...a),
  ...createPeerSlice(...a),
  ...createChatSlice(...a),
  ...createStreamSlice(...a)
}));
// will take a callback as selector like
// const data = useBoundStoreShallow(state => state);
export const useBoundStoreShallow = <T>(
  selectorFunc: (state: AllSliceType) => T
) => {
  return useBoundStore(selectorFunc, shallow);
};

