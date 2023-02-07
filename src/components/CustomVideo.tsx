import { useMainStore } from "@/store/BaseStore";
import { usePeerStore } from "@/store/PeerStore";
import { Dispatch, SetStateAction, useEffect, useMemo, useRef } from "react";
import { useUpdateEffect } from "react-use";

const MyCustomVideo = ({
  userId,
}: {
  // setVideoMap: Dispatch<SetStateAction<Map<string, HTMLVideoElement | null>>>;
  userId: string;
}) => {
  const ref = useRef<HTMLVideoElement>(null);
  const setUserData = useMainStore((state) => state.setUserData);

  useEffect(() => {
    if (!ref.current) return;

    ref.current.defaultMuted = true;
    ref.current.muted = true;
    setUserData(userId, ref.current);
  }, []);

  return (
    <video
      playsInline
      autoPlay
      controls
      controlsList="nodownload"
      ref={ref}
      className="block h-full w-full object-contain"
    ></video>
  );
};

const GuestVideo = ({
  userId,
}: {
  // setVideoMap: Dispatch<SetStateAction<Map<string, HTMLVideoElement | null>>>;
  userId: string;
}) => {
  const ref = useRef<HTMLVideoElement>(null);
  const setVideoElToUser = usePeerStore((state) => state.setVideoElToUser);

  useEffect(() => {
    if (!ref.current) return;

    ref.current.defaultMuted = true;
    ref.current.muted = true;
    setVideoElToUser(userId, ref.current);
  }, []);

  return (
    <video
      playsInline
      controls
      ref={ref}
      className="block h-full w-full object-contain"
    ></video>
  );
};

export { MyCustomVideo, GuestVideo };
