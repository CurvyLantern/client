import { MaybeStream } from "@/types";
import { StateCreator } from "zustand";
import { AllSliceType } from "./types";

interface MainState {
  myStream: MaybeStream;
  foreignStreams: Map<string, MediaStream>;
}
interface Action {
  setMyStream: (stream: MaybeStream) => void;
  addForeignStream: (id: string, stream: MediaStream) => void;
  removeStream: (id: string) => void;
  removeAllStream: () => void;
}

export interface StreamSlice extends MainState, Action {}

const initialState: MainState = {
  foreignStreams: new Map(),
  myStream: null,
};
const createStreamSlice: StateCreator<AllSliceType, [], [], StreamSlice> = (
  set,
  get
) => ({
  ...initialState,
  setMyStream: (stream) => {
    set({
      myStream: stream,
    });
  },
  addForeignStream: (id, stream) => {
    set({
      foreignStreams: new Map(get().foreignStreams).set(id, stream),
    });
  },
  removeStream: (id) => {
    let arr = [];
    const streams = new Map(get().foreignStreams);
    streams.delete(id);
    set({
      foreignStreams: streams,
    });
  },
  removeAllStream: () => {
    set({
      foreignStreams: new Map(),
    });
  },
});

export default createStreamSlice;
