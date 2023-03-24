import { useBoundStoreShallow } from "@/store";
import { audioConstraints, videoConstraints } from "@/utils/Constraints";
import { useRoomJoinToast } from "@/utils/Notifications";
import { createPeer } from "@/utils/peerHelpers";
import { socketEvents } from "@/utils/SocketHelpers";
import { getDisplayStream, stopStream } from "@/utils/StreamHelpers";
import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// FIXME: Fix all the errors

interface Props {
  roomId: string;
}
type MaybeSocket = ReturnType<typeof io> | null;

interface NewPeerProps {
  myUserId: string;
  forWhomId: string;
  forWhomSocketId: string | null;
  stream: MediaStream | null;
  initiator: boolean;
  socket: MaybeSocket;
  roomId: string;
}
const useScreenShare = ({ roomId }: Props) => {
  const notification = useRoomJoinToast();
  const {
    peerMap,
    myStream,
    addMyStream,
    addForeignStream,
    addPeer,
    socket,
    userId,
  } = useBoundStoreShallow((state) => ({
    userId: state.userId,
    socket: state.socket,
    myStream: state.myStream,
    addMyStream: state.addMyStream,
    foreignDisplayStreams: state.foreignDisplayStreams,
    addForeignStream: state.addForeignStream,
    peerMap: state.peerMap,
    addPeer: state.addPeer,
    removeStream: state.removeStream,
  }));
  const renderCount = useRef(0);
  useEffect(() => {
    renderCount.current++;
    console.log(socket, renderCount.current);
  });
  const [isSharing, setIsSharing] = useState(false);

  const createNewPeerForUser = useCallback(
    ({
      forWhomId,
      myUserId,
      initiator,
      forWhomSocketId,
      stream,
      socket,
      roomId,
    }: NewPeerProps) => {
      const peer = createPeer(initiator, stream);
      if (peer) {
        peer.on("signal", (data) => {
          if (socket) {
            socket.emit(socketEvents.sendSignal, {
              toWhomId: forWhomId,
              toWhomSockId: forWhomSocketId,
              signal: data,
              roomId,
            });
          } else {
            throw new Error("no socket found so can't send signal to foreign");
          }
        });
        peer.on("stream", (foreignStream) => {
          console.log(typeof foreignStream, "peer/stream");
          // TODO: what if the stream is an array? handle those
          addForeignStream(foreignStream, "display");
        });
        peer.on("close", (reason: any) => {
          // remove peer from state
          console.log(" peer closed ", reason);
        });
        peer.on("error", (err) => {
          // remove from state and destroy peer;
          throw err;
        });

        addPeer(forWhomId, peer);
      }
    },
    [addForeignStream, addPeer]
  );

  const stopSharing = () => {
    if (!myStream) return;
    peerMap.forEach((peer) => {
      peer.removeStream(myStream);
    });
    setIsSharing(false);
    stopStream(myStream);
  };
  const startSharing = async () => {
    try {
      const stream = await getDisplayStream(
        { video: videoConstraints, audio: audioConstraints },
        stopSharing
      );
      addMyStream(stream);
      setIsSharing(true);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setIsSharing(Boolean(myStream));
  }, [myStream]);

  // init socket connection
  useEffect(() => {
    console.log("socket initialize");
    if (!socket) {
      throw new Error("ooops no sockets detected, please create a socket");
    }
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
      if (!socket)
        throw new Error("oops no sockets initialized , please create one");
      socket.emit(socketEvents.join, roomId);
      notification.start();

      socket.once(socketEvents.joined, joinedListener);
    } catch (err) {
      console.error(err);
    }
    return () => {
      if (!socket)
        throw new Error("oops no sockets initialized , please create one");

      socket.off(socketEvents.joined, joinedListener);
    };
  }, [socket, roomId, notification]);

  // creating peer
  useEffect(() => {
    if (!socket) return;
    const onFriendJoined = ({
      whoJoinedId,
      whoJoinedSockId,
    }: {
      whoJoinedId: string;
      whoJoinedSockId: string;
    }) => {
      console.log("friend joined - ", whoJoinedId);
      createNewPeerForUser({
        myUserId: userId,
        forWhomId: whoJoinedId,
        forWhomSocketId: whoJoinedSockId,
        stream: myStream,
        initiator: true,
        socket,
        roomId,
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
      createNewPeerForUser({
        forWhomId: fromWhomId,
        forWhomSocketId: fromWhomSockId,
        stream: myStream,
        initiator: false,
        myUserId: userId,
        roomId,
        socket,
      });
    };
    socket.on(socketEvents.receive, onReceive);
    return () => {
      socket.off(socketEvents.friendJoined, onFriendJoined);
      socket.off(socketEvents.receive, onReceive);
    };
  }, [socket, createNewPeerForUser, myStream, userId, roomId]);

  // signalling
  useEffect(() => {
    if (!socket) return;
    const onReceiveSignal = ({
      fromWhomId,
      signal,
    }: {
      fromWhomId: string;
      signal: any;
    }) => {
      console.log("receiving signal from friend - ", fromWhomId);
      peerMap.get(fromWhomId)?.signal(signal);
    };
    socket.on(socketEvents.receiveSignal, onReceiveSignal);
    return () => {
      socket.off(socketEvents.receiveSignal, onReceiveSignal);
    };
  }, [socket, peerMap]);
  return {
    isSharing,
    startSharing,
    stopSharing,
  };
};

export default useScreenShare;
/* 

  const createNewPeerUser = useCallback(
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
      let peer = createNewPeerUser(initiator, stream);

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

*/
