import { AspectRatio, Skeleton } from "@mantine/core";
import { forwardRef } from "react";

const Comp = (props: {}, ref: any) => {
  return (
    <AspectRatio ratio={16 / 9} className="w-full">
      <Skeleton></Skeleton>
      <video
        muted
        playsInline
        autoPlay
        controls
        ref={ref}
        className="block h-full w-full object-contain"
      ></video>
    </AspectRatio>
  );
};

const CommonUserMedia = forwardRef(Comp);
export { CommonUserMedia };
