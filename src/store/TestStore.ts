import { create } from "zustand";

interface MainState {
  counter: number;
}
type Action = {
  update: (n: number) => void;
};
const useTestStore = create<MainState & Action>()((set, get) => ({
  counter: 0,
  update: (n) => {
    set((state) => ({
      counter: state.counter + n,
    }));
  },
}));

export { useTestStore };
