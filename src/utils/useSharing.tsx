import { useMainStore } from "@/store/BaseStore";
import { createPeer } from "@/utils/Helpers";
import {
  hideNotification,
  showNotification,
  updateNotification,
} from "@mantine/notifications";
import { useEffect, useRef } from "react";
import SimplePeer from "simple-peer";
type PeerMap = Map<
  string,
  {
    used: boolean;
    peer: SimplePeer.Instance | null;
    remoteStream: MediaStream | null;
  }
>;

const debug = (val: any, num: number) => {
  console.log({ num, val });
};

let room_noti_id = "room-notification";
const useSharing = (roomId: string) => {
  // const [track, setTrack] = useState(0);
  // const peerMapRef = useRef<PeerMap>(new Map());
  // const { socket, userId } = useContext(SocketContext);

  const peerMap = useRef<PeerMap>(new Map());
  const myTotalStreamRef = useRef<MediaStream | null>(null);

  const userId = useMainStore((state) => state.userId);
  const socket = useMainStore((state) => state.socket);
  const userData = useMainStore((state) => state.userData);
  const setUserData = useMainStore((state) => state.setUserData);
  const mergeUserData = useMainStore((state) => state.mergeUserData);
  const clearUser = useMainStore((state) => state.clearUser);
  const clearAllUser = useMainStore((state) => state.clearAllUser);
  const destroyPeerFromMap = (id: string, msg?: string) => {
    let peer = peerMap.current.get(id)?.peer;
    peer?.removeAllListeners();
    peer?.destroy();
    let deleted = peerMap.current.delete(id);
    if (deleted) {
      console.log("deletion success");
    }
  };

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
    if (peerMap.current.has(forWhomId)) {
      debug("destroying peer 2", 1);
      destroyPeerFromMap(forWhomId);
    }
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
      console.log("hello hello");
      peerMap.current.set(forWhomId, {
        used: false,
        peer,
        remoteStream: null,
      });

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
        const el = userDataRef.current.get(forWhomId);
        console.log("received stream", remoteStream, forWhomId, el);
        if (el) {
          el.srcObject = remoteStream;
          console.log({ el, remoteStream });
          el.onloadedmetadata = (event) => {
            console.log(event, "loaded meta data");
            el.play();
          };
        } else {
          console.log(userDataRef.current, "what now");
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

        destroyPeerFromMap(forWhomId, "now destroying receive on event error");
      });
    }
  };

  /* transient updates by zustand it makes this so simple */
  const userDataRef = useRef(useMainStore.getState().userData);
  useEffect(() => {
    if (!socket) return;

    // Transient settings
    useMainStore.subscribe((state) => (userDataRef.current = state.userData));

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
        setUserData(whoJoinedId, null);
        createNewPeer({
          myUserId: userId,
          forWhomId: whoJoinedId,
          forWhomSocketId: whoJoinedSockId,
          stream: myTotalStreamRef.current,
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
        mergeUserData(fromWhomId);

        createNewPeer({
          forWhomId: fromWhomId,
          forWhomSocketId: fromWhomSockId,
          stream: myTotalStreamRef.current,
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
      peerMap.current.get(fromWhomId)?.peer?.signal(signal);
    };
    socket.on("receive-signal-from-friend", handler);

    // clean up when friend logs out
    const cleanUpHandler = ({ who }: { who: string }) => {
      debug(`someone logged out - ${who}`, 20);

      if (peerMap.current.has(who)) {
        destroyPeerFromMap(who, "logged out cleaner destroy");
        peerMap.current.delete(who);
      }

      clearUser(who);
    };
    socket.on("friend-logged-out", cleanUpHandler);

    () => {
      console.log("unmounting react use");
      hideNotification(room_noti_id);
      socket?.emit("logging-out", { roomId });
    };
  }, []);
  const createNewInitiatorPeer = ({
    forWhomId,
    stream,
  }: {
    forWhomId: string;
    stream: MediaStream | null;
  }) => {
    createNewPeer({
      myUserId: userId,
      stream,
      forWhomId: forWhomId,
      forWhomSocketId: null,
      initiator: true,
    });
  };

  const clearEveryThing = (cb: () => void) => {
    peerMap.current.forEach((obj) => {
      obj.peer?.destroy();
    });
    peerMap.current.clear();
    clearAllUser();
    cb();
  };

  return [myTotalStreamRef, createNewInitiatorPeer, clearEveryThing] as const;
};

export default useSharing;
