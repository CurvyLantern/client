import { CommonUserMedia } from "@/components/video/CommonVideo";
import { usePeerStore } from "@/store/peerSlice";
import { useCallback, useEffect, useRef } from "react";


const GuestVideo = ({
  userId,
}: {
  // setVideoMap: Dispatch<SetStateAction<Map<string, HTMLVideoElement | null>>>;
  userId: string;
}) => {
  const ref = useRef<HTMLVideoElement>(null);
  const setVideoElToUser = usePeerStore(
    useCallback((state) => state.setVideoElToUser, [])
  );

  useEffect(() => {
    if (!ref.current) return;

    ref.current.defaultMuted = true;
    ref.current.muted = true;
    setVideoElToUser(userId, ref.current);
  }, [setVideoElToUser, userId]);

  return <CommonUserMedia ref={ref} />;
};

export { GuestVideo };
