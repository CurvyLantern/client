import ActionBar from "@/components/action/ActionBar";
import ActiveMediaUsers from "@/components/user/ActiveMediaUser";
import useHydrated from "@/hooks/useHydrated";
import useMemberQueue from "@/hooks/useMemberQueue";
import useRandomMemberCheck from "@/hooks/useRandomMemberCheck";
import useScreenShare from "@/hooks/useScreenShare";
import { useBoundStore } from "@/store";
import { socketEvents } from "@/utils/SocketHelpers";
import { NextPage } from "next";
import { NextRouter, withRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";

interface RoomPageProps {
  router: NextRouter;
}

const RoomPage: NextPage<RoomPageProps> = ({ router }) => {
  const userId = useBoundStore((s) => s.userId);
  const socket = useBoundStore((s) => s.socket);
  const peerMap = useBoundStore((s) => s.peerMap);
  const foreignStreams = useBoundStore((s) => s.foreignStreams);

  const myStream = useBoundStore((s) => s.myStream);

  // Hooks
  const { startSharing, stopSharing } = useScreenShare();
  const { onQueueMembers, remove } = useMemberQueue();
  const checkingComplete = useRandomMemberCheck();
  const [hasHydrated] = useHydrated();

  const roomId = router.query.roomId as string;

  // join the room
  useEffect(() => {
    if (socket?.connected && checkingComplete && roomId) {
      socket.emit(socketEvents.join, roomId);
    }
  }, [socket, checkingComplete, roomId]);

  const foreignStreamsArray = useMemo(
    () => Array.from(foreignStreams),
    [foreignStreams]
  );

  if (!checkingComplete) {
    return <div>wait let me check if you are allowed</div>;
  }

  const onAcceptMember = ({
    userId,
    socketId,
  }: {
    userId: string;
    socketId: string;
  }) => {
    if (socket && socket.connected) {
      socket.emit(socketEvents.permissionGranted, { socketId, userId, roomId });
    }
    remove({ socketId, userId });
  };
  // const onDeclineMember = ({
  //   userId,
  //   socketId,
  // }: {
  //   userId: string;
  //   socketId: string;
  // }) => {
  //   if (socket && socket.connected) {
  //     socket.emit(socketEvents.permissionRejected, {
  //       socketId,
  //       userId,
  //       roomId,
  //     });
  //   }
  //   remove({ socketId, userId });
  // };

  return (
    <>
      <div>{hasHydrated ? userId : " "}</div>
      <div>{peerMap.size} peers available</div>
      <div className="absolute left-0 top-0 flex w-full items-center justify-center pt-3">
        {onQueueMembers.map((member, index) => (
          <div
            key={index}
            className="flex items-center justify-center gap-3 rounded-lg bg-neutral-600 p-3 shadow-md shadow-neutral-700"
          >
            <div className="flex flex-col items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-neutral-300"></div>
              <p>{member.userId}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onAcceptMember(member);
                }}
                className="rounded-md bg-green-400 px-3 py-1  text-white"
              >
                Accept
              </button>
              {/* <button
                onClick={() => {
                  onDeclineMember(member);
                }}
                className="rounded-md bg-red-400 px-3 py-1 text-white"
              >
                Decline
              </button> */}
            </div>
          </div>
        ))}
      </div>

      <div
        className="mx-auto flex max-w-screen-lg flex-wrap
      items-center justify-center gap-5 p-5"
      >
        {myStream ? <ActiveMediaUsers stream={myStream} /> : null}
        {foreignStreamsArray.map(([id, stream], index) => (
          <ActiveMediaUsers key={index} stream={stream} />
        ))}
      </div>
      <ActionBar
        startScreenShare={startSharing}
        stopScreenShare={stopSharing}
      />
    </>
  );
};

export default withRouter(RoomPage);
