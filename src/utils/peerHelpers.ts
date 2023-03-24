import { ICE_SERVERS } from "@/ICE";
import Peer from "simple-peer";
import isDevMode from "./isDevMode";

export const createPeer = (
  initiator: boolean = false,
  stream: MediaStream | null
) => {
  const peer = new Peer({
    initiator,
    trickle: true,
    stream: stream ? stream : undefined,
    config: {
      iceServers: ICE_SERVERS,
      bundlePolicy: "balanced",
    },
  });

  if (isDevMode()) {
    peer._debug = console.log;
  }

  return peer;
};
