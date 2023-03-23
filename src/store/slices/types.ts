import { ChatSlice } from "./chatSlice";
import { MainSlice } from "./mainSlice";
import { PeerSlice } from "./peerSlice";

export interface AllSliceType extends MainSlice, PeerSlice, ChatSlice {}
