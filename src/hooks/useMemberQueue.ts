import { useBoundStore } from "@/store";
import { socketEvents } from "@/utils/SocketHelpers";
import { useCallback, useEffect, useState } from "react";
interface Member {
  userId: string;
  socketId: string;
}
const useMemberQueue = () => {
  const [onQueueMembers, setOnQueueMembers] = useState<Member[]>([]);
  const socket = useBoundStore((s) => s.socket);
  useEffect(() => {
    const handler = ({
      socketId,
      userId,
    }: {
      socketId: string;
      userId: string;
    }) => {
      console.log(" hey there I am 77 ");
      setOnQueueMembers((prev) => [...prev, { socketId, userId }]);
    };
    socket?.on(socketEvents.grantPermission, handler);
    return () => {
      socket?.off(socketEvents.grantPermission, handler);
    };
  }, [socket]);
  const remove = useCallback(
    (member: Member) => {
      const curMembers = onQueueMembers.filter(
        (qMember) => member.userId !== qMember.userId
      );
      setOnQueueMembers(curMembers);
    },
    [onQueueMembers]
  );
  return { onQueueMembers, remove };
};

export default useMemberQueue;
