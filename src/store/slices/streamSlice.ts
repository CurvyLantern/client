import { MaybeStream } from "@/types";
import { isStream } from "@/utils/StreamHelpers";
import type { Instance } from "simple-peer";
import { StateCreator } from "zustand";
import { AllSliceType } from "./types";

type MaybePeer = Instance | null;
type PeerMapType = Map<string, MaybePeer>;
interface MainState {
  myStream: MaybeStream;
  foreignDisplayStreams: MediaStream[];
  foreignUserStreams: MediaStream[];
}
interface Action {
  addMyStream: (stream: MaybeStream) => void;
  addForeignStream: (stream: MaybeStream, type: "user" | "display") => void;
  removeStream: (stream: MediaStream, type: "user" | "display") => void;
  removeAllStream: () => void;
}

export interface StreamSlice extends MainState, Action {}

const initialState: MainState = {
  foreignDisplayStreams: [],
  foreignUserStreams: [],
  myStream: null,
};
const createStreamSlice: StateCreator<AllSliceType, [], [], StreamSlice> = (
  set,
  get
) => ({
  ...initialState,
  addMyStream: (stream) => {
    set({
      myStream: stream,
    });
  },
  addForeignStream: (stream, type) => {
    // TODO: figure out why can't typescript detect this check
    if (!stream) return;
    if (!isStream(stream)) return;
    if (type === "display") {
      set({
        foreignDisplayStreams: [...get().foreignDisplayStreams, stream],
      });
    } else if (type === "user") {
      set({
        foreignUserStreams: [...get().foreignUserStreams, stream],
      });
    }
  },
  removeStream: (stream, type) => {
    let arr = [];
    if (type === "display") {
      arr = get().foreignDisplayStreams.filter(
        (_stream) => _stream.id !== stream.id
      );
      set({
        foreignDisplayStreams: arr,
      });
    } else if (type === "user") {
      arr = get().foreignUserStreams.filter(
        (_stream) => _stream.id !== stream.id
      );
      set({
        foreignUserStreams: arr,
      });
    }
  },
  removeAllStream: () => {
    set({
      foreignDisplayStreams: [],
      foreignUserStreams: [],
    });
  },
});

export default createStreamSlice;
