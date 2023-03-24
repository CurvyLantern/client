import { ChatSlice } from "./chatSlice";
import { MainSlice } from "./mainSlice";
import { PeerSlice } from "./peerSlice";
import { StreamSlice } from "./streamSlice";

export interface AllSliceType
  extends MainSlice,
    PeerSlice,
    ChatSlice,
    StreamSlice {}
