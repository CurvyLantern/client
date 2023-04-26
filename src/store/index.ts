import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import createChatSlice from "./slices/chatSlice";
import createMainSlice from "./slices/mainSlice";
import createPeerSlice from "./slices/peerSlice";
import createStreamSlice from "./slices/streamSlice";
import { AllSliceType } from "./slices/types";

export const useBoundStore = create<AllSliceType>()(
  persist(
    (...a) => ({
      ...createMainSlice(...a),
      ...createPeerSlice(...a),
      ...createChatSlice(...a),
      ...createStreamSlice(...a),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ userId }) => ({ userId }),
    }
  )
);
// will take a callback as selector like
// const data = useBoundStoreShallow(state => state);
export const useBoundStoreShallow = <T>(
  selectorFunc: (state: AllSliceType) => T
) => {
  return useBoundStore(selectorFunc, shallow);
};

