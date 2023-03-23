import { useMainStore } from "@/store/mainSlice";
import type { MaybeStream } from "@/types";
import { audioConstraints, videoConstraints } from "@/utils/Constraints";
import { createPeer, stopStream } from "@/utils/Helpers";
import { useRoomJoinNotification } from "@/utils/Notifications";
import { socketEvents } from "@/utils/SocketHelpers";
import { getStream } from "@/utils/StreamHelpers";
import { useCallback, useEffect, useRef, useState } from "react";
import { Instance } from "simple-peer";

interface Props {
  roomId: string;
}
interface NewPeerProps {
  myUserId: string;
  forWhomId: string;
  forWhomSocketId: string | null;
  stream: MediaStream | null;
  initiator: boolean;
}
const useScreenShare = ({ roomId }: Props) => {
  const notification = useRoomJoinNotification();
  const { socket, userId } = useMainStore((state) => state);
  const [isSharing, setIsSharing] = useState(false);
  const [myScreenStream, setMyScreenStream] = useState<MaybeStream>(null);
  const [foreignPeers, setForeignPeers] = useState<Map<string, Instance>>(
    new Map()
  );
  const [foreignStreams, setForeignStreams] = useState<MaybeStream[]>([]);

  const createNewPeer = useCallback(
    ({
      myUserId,
      forWhomId,
      forWhomSocketId,
      stream,
      initiator,
    }: NewPeerProps) => {
      if (!socket) throw new Error("no socket so can not create peer");
      const destroyPeerFromState = (id: string) => {
        if (!peer) return;
        peer.removeAllListeners();
        peer.destroy();
        setForeignPeers((peers) => {
          const _peers = new Map(peers);
          _peers.delete(id);
          return _peers;
        });
      };

      if (initiator) {
        socket.emit("create-receive-peer", {
          toWhomId: forWhomId,
          toWhomSockId: forWhomSocketId,
          roomId,
        });
      }
      let peer = createPeer(initiator, stream);

      if (peer) {
        console.log(stream, "created peer and given stream");
        // setForeignPeers(peers => [...peers, peer]);

        peer.on("signal", (data) => {
          console.log("receiving signal ", initiator);
          console.log("sending signal to - ", forWhomId);

          // if(peer.)

          socket.emit("send-signal-to-friend", {
            toWhomId: forWhomId,
            toWhomSockId: forWhomSocketId, // can be null
            signal: data,
            roomId,
          });
        });
        peer.on("stream", (remoteStream) => {
          console.log("received stream", remoteStream, forWhomId);
          setForeignStreams((streams) => [...streams, remoteStream]);
        });

        peer.on("track", (track, stream) => {
          console.log("hello there 2");
        });

        peer.on("close", (reason: any) => {
          // destroyPeer(peer, from);
          console.log("peer closed", reason);
        });

        peer.on("error", (error) => {
          console.error(error);
          destroyPeerFromState(forWhomId);
        });

        setForeignPeers((peers) => new Map(peers).set(forWhomId, peer));
      }
    },
    [roomId, socket]
  );
  const renderCount = useRef(0);
  useEffect(() => {
    renderCount.current++;
    console.log(socket, renderCount.current);
  });

  const stopSharing = () => {
    if (!myScreenStream) return;
    foreignPeers.forEach((peer, userId) => {
      peer?.removeStream(myScreenStream);
    });
    setIsSharing(false);
    stopStream(myScreenStream);
  };
  const startSharing = async () => {
    try {
      const stream = await getStream(
        { video: videoConstraints, audio: audioConstraints },
        stopSharing
      );
      setMyScreenStream(stream ? stream : null);
      setIsSharing(true);

      console.log(foreignPeers, "count");
      foreignPeers.forEach((peer, userId) => {
        peer?.addStream(stream);
      });
    } catch (error) {
      console.error(error);
    }
  };

  // init socket connection
  useEffect(() => {
    console.log("socket initialize");
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  // connecting to room
  useEffect(() => {
    const joinedListener = (roomId: string) => {
      notification.update();
    };
    try {
      socket.emit(socketEvents.join, roomId);
      notification.start();

      socket.once(socketEvents.joined, joinedListener);
    } catch (err) {
      console.error(err);
    }
    return () => {
      socket.off(socketEvents.joined, joinedListener);
    };
  }, [socket, roomId, notification]);

  // creating peer
  useEffect(() => {
    const onFriendJoined = ({
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
        stream: myScreenStream,
        initiator: true,
      });
    };
    socket.on(socketEvents.friendJoined, onFriendJoined);

    const onReceive = ({
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
    };
    socket.on(socketEvents.receive, onReceive);
    return () => {
      socket.off(socketEvents.friendJoined, onFriendJoined);
      socket.off(socketEvents.receive, onReceive);
    };
  }, [socket, createNewPeer, myScreenStream, userId]);

  // signalling
  useEffect(() => {
    const onReceiveSignal = ({
      fromWhomId,
      signal,
    }: {
      fromWhomId: string;
      signal: any;
    }) => {
      console.log("receiving signal from friend - ", fromWhomId);
      foreignPeers.get(fromWhomId)?.signal(signal);
    };
    socket.on(socketEvents.receiveSignal, onReceiveSignal);
    return () => {
      socket.off(socketEvents.receiveSignal, onReceiveSignal);
    };
  }, [socket, foreignPeers]);
  return {
    isSharing,
    myScreenStream,
    foreignStreams,
    startSharing,
    stopSharing,
  };
};

export default useScreenShare;
