import { MaybeStream } from "@/types";
import { AspectRatio, Button, Center, Skeleton } from "@mantine/core";
import { FC, useEffect, useRef, useState } from "react";

interface StreamWatcherProps {
  stream: MaybeStream;
  host?: boolean;
}
const StreamWatcher: FC<StreamWatcherProps> = ({ stream, host }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [wantsToWatch, setWantsToWatch] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      if (host || wantsToWatch) {
        el.srcObject = stream;
      }
    }
    return () => {
      if (el) {
        el.srcObject = null;
      }
    };
  }, [wantsToWatch, stream, host]);
  const notHost = !host;
  if (notHost) {
    return (
      <AspectRatio ratio={16 / 9} className="w-full">
        <Skeleton></Skeleton>
        {wantsToWatch ? (
          <video
            playsInline
            autoPlay
            controls
            ref={ref}
            className="block h-full w-full object-contain"
          />
        ) : (
          <Center>
            <Button
              styles={(theme) => ({
                root: {
                  borderRadius: theme.radius.lg,
                  backgroundColor: theme.colors.gray,
                },
              })}
              onClick={() => {
                setWantsToWatch(true);
              }}
            >
              watch stream
            </Button>
          </Center>
        )}
      </AspectRatio>
    );
  }
  return (
    <AspectRatio ratio={16 / 9} className="w-full">
      <video
        playsInline
        autoPlay
        muted
        ref={ref}
        className="block h-full w-full object-contain"
      />
    </AspectRatio>
  );
};
export default StreamWatcher;
