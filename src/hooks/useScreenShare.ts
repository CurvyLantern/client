import { useBoundStore, useBoundStoreShallow } from "@/store";
import { audioConstraints, videoConstraints } from "@/utils/Constraints";
import { useRoomJoinToast } from "@/utils/Notifications";
import { createPeer } from "@/utils/peerHelpers";
import { socketEvents } from "@/utils/SocketHelpers";
import { getDisplayStream, stopStream } from "@/utils/StreamHelpers";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// FIXME: Fix all the errors

type MaybeSocket = ReturnType<typeof io> | null;

interface NewPeerProps {
  forWhomId: string;
  forWhomSocketId: string | null;
  initiator: boolean;
  signal?: any;
}
const useScreenShare = () => {
  const { roomId } = useRouter().query as { roomId: string };
  const notification = useRoomJoinToast();
  const peerMap = useBoundStore((s) => s.peerMap);
  const myStream = useBoundStore((s) => s.myStream);
  const socket = useBoundStore((s) => s.socket);
  const userId = useBoundStore((s) => s.userId);
  const setMyStream = useBoundStore((s) => s.setMyStream);
  const addPeer = useBoundStore((s) => s.addPeer);
  const removePeer = useBoundStore((s) => s.removePeer);
  const foreignStreams = useBoundStore((s) => s.foreignStreams);
  const addForeignStream = useBoundStore((s) => s.addForeignStream);
  const removeStream = useBoundStore((s) => s.removeStream);

  const renderCount = useRef(0);
  useEffect(() => {
    renderCount.current++;
    // console.log(socket, renderCount.current);
  });

  const createNewPeerForUser = useCallback(
    ({ forWhomId, initiator, forWhomSocketId, signal }: NewPeerProps) => {
      const peer = createPeer(initiator, myStream);
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
          // console.log(typeof foreignStream, "peer/stream");
          // TODO: what if the stream is an array? handle those
          // foreignStream.getTracks().forEach((track) => {
          //   track.addEventListener("ended", () => {
          //     foreignStream.removeTrack(track);
          //   });
          // });
          addForeignStream(forWhomId, foreignStream);
        });
        peer.on("close", (reason: any) => {
          // remove peer from state
          peer.destroy();
          removePeer(forWhomId);
          removeStream(forWhomId);
          // console.log(" peer closed ", reason);
        });
        peer.on("error", (err) => {
          // remove from state and destroy peer;
          removeStream(forWhomId);
          peer.destroy();
          removePeer(forWhomId);
          console.error(err);
        });
        if (signal) {
          peer.signal(signal);
        }
        addPeer(forWhomId, peer);
      }
    },
    [
      addForeignStream,
      removeStream,
      addPeer,
      removePeer,
      roomId,
      socket,
      myStream,
    ]
  );

  const stopSharing = () => {
    if (!myStream) return;
    peerMap.forEach((peer) => {
      peer.removeStream(myStream);
    });
    stopStream(myStream);
    setMyStream(null);
  };
  const startSharing = async () => {
    try {
      const stream = await getDisplayStream(
        { video: videoConstraints, audio: audioConstraints },
        stopSharing
      );
      peerMap.forEach((peer) => {
        peer.addStream(stream);
      });
      setMyStream(stream);
    } catch (error) {
      console.error(error);
    }
  };

  // on friend join and on receive request
  // peer creation
  useEffect(() => {
    if (!socket) return;
    const onFriendJoined = ({
      whoJoinedId,
      whoJoinedSockId,
    }: {
      whoJoinedId: string;
      whoJoinedSockId: string;
    }) => {
      // console.log("friend joined - ", whoJoinedId);
      // alert("mey mey");
      createNewPeerForUser({
        forWhomId: whoJoinedId,
        forWhomSocketId: whoJoinedSockId,
        initiator: true,
      });
    };
    socket.on(socketEvents.friendJoined, onFriendJoined);

    // const onReceive = ({
    //   fromWhomId,
    //   fromWhomSockId,
    // }: {
    //   fromWhomSockId: string;
    //   fromWhomId: string;
    // }) => {
    //   // alert("hey hey");
    //   createNewPeerForUser({
    //     forWhomId: fromWhomId,
    //     forWhomSocketId: fromWhomSockId,
    //     initiator: false,
    //   });
    // };
    // socket.on(socketEvents.receive, onReceive);
    return () => {
      socket.off(socketEvents.friendJoined, onFriendJoined);
      // socket.off(socketEvents.receive, onReceive);
    };
  }, [socket, createNewPeerForUser]);

  // signalling
  useEffect(() => {
    if (!socket) return;
    const onReceiveSignal = ({
      fromWhomSockId,
      fromWhomId,
      signal,
    }: {
      fromWhomSockId: string;
      fromWhomId: string;
      signal: any;
    }) => {
      // console.log("receiving signal from friend - ", fromWhomId);
      // alert("mew mew");
      if (peerMap.has(fromWhomId)) {
        peerMap.get(fromWhomId)!.signal(signal);
      } else {
        createNewPeerForUser({
          forWhomId: fromWhomId,
          forWhomSocketId: fromWhomSockId,
          initiator: false,
          signal,
        });
      }
    };
    socket.on(socketEvents.receiveSignal, onReceiveSignal);
    return () => {
      socket.off(socketEvents.receiveSignal, onReceiveSignal);
    };
  }, [socket, peerMap, createNewPeerForUser]);
  return {
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
