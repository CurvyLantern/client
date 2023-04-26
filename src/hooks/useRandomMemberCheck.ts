import { useBoundStore } from "@/store";
import router, { useRouter } from "next/router";
import { useState, useEffect } from "react";

const useRandomMemberCheck = () => {
  const [checkingComplete, setCheckingComplete] = useState(false);
  const userId = useBoundStore((s) => s.userId);
  const { query, push } = useRouter();
  const roomId = query.roomId as string;
  useEffect(() => {
    if (!userId || !roomId) return;
    const controller = new AbortController();
    const signal = controller.signal;
    const fetcher = async () => {
      const { state } = await fetch(
        `/api/v1/checkRandomMember/${roomId}/${userId}`,
        { signal }
      ).then<{ state: boolean }>((res) => res.json());
      if (state) {
        setCheckingComplete(state);
      } else {
        const searchParam = new URLSearchParams({
          roomId,
          userId,
        });
        push({
          pathname: "waitlist",
          search: searchParam.toString(),
        });
      }
    };
    fetcher();
  }, [userId, roomId, push]);

  return checkingComplete;
};

export default useRandomMemberCheck;
