import { type MutableRefObject } from "react";
import type { SimplePeer, Instance } from "simple-peer";

export type MaybeStream = MediaStream | null;
export type HostCallStreamType = MutableRefObject<MaybeStream>;
export type MaybeVideoEl = HTMLVideoElement | null;
export type MaybePeer = Instance | null;
export type PeerDataType = {
  peer?: MaybePeer;
  videoEl?: MaybeVideoEl;
  used?: boolean;
};
export type PeerMapType = Map<string, PeerDataType>;

// chat types
export type ChatType = {
  username: string;
  message: string;
  time: string;
};

export type ChatArray = Array<ChatType & { id: string }>;
