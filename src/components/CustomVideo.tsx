import { CommonUserMedia } from "@/components/video/CommonVideo";
import { useMainStore } from "@/store/BaseStore";
import { usePeerStore } from "@/store/PeerStore";
import { AspectRatio, Skeleton } from "@mantine/core";
import {
  Dispatch,
  SetStateAction,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useUpdateEffect } from "react-use";


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
