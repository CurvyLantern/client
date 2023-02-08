import { useMainStore } from "@/store/BaseStore";
import { usePeerStore } from "@/store/PeerStore";
import { MaybeStream } from "@/types";
import { createPeer } from "@/utils/Helpers";
import {
  hideNotification,
  showNotification,
  updateNotification,
} from "@mantine/notifications";
import { useEffect, useRef } from "react";
import SimplePeer from "simple-peer";

const debug = (val: any, num: number) => {
  console.log({ num, val });
};

let room_noti_id = "room-notification";
const usePeer = (roomId: string) => {
  // const [track, setTrack] = useState(0);
  // const peerMapRef = useRef<PeerMap>(new Map());
  // const { socket, userId } = useContext(SocketContext);

  const userId = useMainStore((state) => state.userId);
  const socket = useMainStore((state) => state.socket);
  const peerData = usePeerStore((state) => state.peerData);
  const initPeerData = usePeerStore((state) => state.initPeerData);
  const clearUser = usePeerStore((state) => state.clearUser);
  const clearAllUser = usePeerStore((state) => state.clearAllUser);

  /* transient updates by zustand it makes this so simple */
  const peerDataRef = useRef(usePeerStore.getState().peerData);

  useEffect(() => {
    console.log("I should run only once");
    if (!socket) return;

    usePeerStore.subscribe((state) => (peerDataRef.current = state.peerData));

    const createNewPeer = ({
      myUserId,
      forWhomId,
      forWhomSocketId,
      stream,
      initiator,
    }: {
      myUserId: string;
      forWhomId: string;
      forWhomSocketId: string | null;
      stream: MediaStream | null;
      initiator: boolean;
    }) => {
      if (!socket) return;
      if (peerDataRef.current.has(forWhomId)) return;
      let peer: SimplePeer.Instance;

      if (initiator) {
        socket.emit("create-receive-peer", {
          toWhomId: forWhomId,
          toWhomSockId: forWhomSocketId,
          roomId,
        });
      }
      peer = createPeer(initiator, stream);

      if (peer) {
        console.log(stream, "given one");
        initPeerData(forWhomId, peer, null);

        peer.on("signal", (data) => {
          console.log("receiving signal ", initiator);
          console.log("sending signal to - ", forWhomId);
          socket.emit("send-signal-to-friend", {
            toWhomId: forWhomId,
            toWhomSockId: forWhomSocketId, // can be null
            signal: data,
            roomId,
          });
        });
        peer.on("stream", (remoteStream) => {
          const el = peerDataRef.current.get(forWhomId)?.videoEl;
          console.log("received stream", remoteStream, forWhomId, el);
          if (el) {
            el.srcObject = remoteStream;
            console.log({ el, remoteStream });
            el.onloadedmetadata = (event) => {
              console.log(event, "loaded meta data");
              el.play();
              el.muted = false;
            };
          } else {
            console.log("no element");
          }
        });

        peer.on("track", (track, stream) => {
          console.log("hello there 2");
        });

        peer.on("close", () => {
          // destroyPeer(peer, from);
          console.log("peer closed");
        });

        peer.on("error", (error) => {
          console.error(error);

          destroyPeerFromMap(
            forWhomId,
            "now destroying receive on event error"
          );
        });
      }
    };
    const destroyPeerFromMap = (id: string, msg?: string) => {
      let peer = peerDataRef.current.get(id)?.peer;
      peer?.removeAllListeners();
      peer?.destroy();
      let deleted = clearUser(id);
      if (deleted) {
        console.log("deletion success");
      }
    };

    /// connect socket
    if (!socket.connected) {
      socket.connect();
    }
    //join room
    // this also notifies everyone else in room
    socket.emit("join-room", roomId);
    showNotification({
      id: room_noti_id,
      message: "",
      title: "Joining Room",
      autoClose: false,
      disallowClose: true,
      loading: true,
    });
    socket.on("joined-room", (roomId) => {
      updateNotification({
        id: room_noti_id,
        message: "",
        title: "Joined room",
        autoClose: 5000,
        color: "blue",
        disallowClose: true,
      });
    });
    // room joining end

    // wait for someone to join
    // listen for event
    socket.on(
      "friend-joined-room",
      ({
        whoJoinedId,
        whoJoinedSockId,
      }: {
        whoJoinedId: string;
        whoJoinedSockId: string;
      }) => {
        console.log("friend joined - ", whoJoinedId);
        createNewPeer({
          myUserId: userId,
          forWhomId: whoJoinedId,
          forWhomSocketId: whoJoinedSockId,
          stream: null,
          initiator: true,
        });
      }
    );

    //create receive peer on request
    socket.on(
      "create-receive-peer",
      ({
        fromWhomId,
        fromWhomSockId,
      }: {
        fromWhomSockId: string;
        fromWhomId: string;
      }) => {
        createNewPeer({
          forWhomId: fromWhomId,
          forWhomSocketId: fromWhomSockId,
          stream: null,
          initiator: false,
          myUserId: userId,
        });
      }
    );

    const handler = ({
      fromWhomId,
      signal,
    }: {
      fromWhomId: string;
      signal: any;
    }) => {
      console.log("receiving signal from friend - ", fromWhomId);
      peerDataRef.current.get(fromWhomId)?.peer?.signal(signal);
    };
    socket.on("receive-signal-from-friend", handler);

    // clean up when friend logs out
    const cleanUpHandler = ({ who }: { who: string }) => {
      debug(`someone logged out - ${who}`, 20);
      destroyPeerFromMap(who, "logged out cleaner destroy");
    };
    socket.on("friend-logged-out", cleanUpHandler);

    () => {
      console.log("unmounting react use");
      hideNotification(room_noti_id);
      socket?.emit("logging-out", { roomId });
      socket.removeAllListeners();
    };
  }, [roomId, userId, socket]);
  const clearEveryThing = (cb: () => void) => {
    clearAllUser();
    cb();
  };

  const addCallStream = (stream: MaybeStream) => {
    if (!stream) throw new Error(" no call stream povided ");
    peerData.forEach((obj) => {
      obj.peer?.addStream(stream);
    });
  };
  const addScreenStream = (stream: MaybeStream) => {
    if (!stream) throw new Error(" no Screen stream povided ");

    console.log(peerData);

    peerData.forEach((obj) => {
      obj.peer?.addStream(stream);
    });
  };
  const removeStream = (stream: MaybeStream, streamId?: string) => {
    if (!stream) throw new Error(" no Screen stream povided ");
    peerData.forEach((obj) => {
      obj.peer?.removeStream(stream);
    });
  };

  return {
    clearEveryThing,
    addCallStream,
    addScreenStream,
    removeStream,
  } as const;
};

export { usePeer };
