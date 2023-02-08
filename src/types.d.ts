import { type MutableRefObject } from "react";

type MaybeStream = MediaStream | null;
type HostCallStreamType = MutableRefObject<MaybeStream>;
type MaybeVideoEl = HTMLVideoElement | null;
type MaybePeer = SimplePeer.Instance | null;
type PeerDataType = {
  peer?: MaybePeer;
  videoEl?: MaybeVideoEl;
  used?: boolean;
};
type PeerMapType = Map<string, PeerDataType>;


// chat types
type ChatType = {
  username:string,
  message:string,
  time:string
}

type ChatArray = Array<ChatType & {id: string}>