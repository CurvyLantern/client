import { useMainStore } from "@/store/BaseStore";
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
      ref={ref}
      className="block h-full w-full object-contain"
    ></video>
  );
};
export { MyCustomVideo };
