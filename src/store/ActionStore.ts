import { create } from "zustand";

interface MainState {
  callMuted: boolean;
  isInCall: boolean;
}
type Action = {
  setMuteMode: (state: boolean) => void;
  setIsInCall: (state: boolean) => void;
};
const useActionStore = create<MainState & Action>()((set) => {
  return {
    callMuted: true,
    isInCall: false,
    setMuteMode: (mode) =>
      set((state) => ({
        callMuted: mode,
      })),
    setIsInCall: (mode) => {
      set((state) => ({
        isInCall: mode,
      }));
    },
  };
});

export { useActionStore };
