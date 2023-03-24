import { useBoundStore } from "@/store";
import { socketEvents } from "@/utils/SocketHelpers";
import { useEffect, useRef } from "react";

const WaitRoom = () => {
  const socket = useBoundStore((state) => state.socket);
  const userId = useBoundStore((state) => state.userId);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (el) {
      console.log("element exists");

      const initialSetup = async () => {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const constraints = devices.reduce(
          (acc, device) => {
            if (device.kind === "videoinput") {
              acc.video = true;
            } else if (device.kind === "audioinput") {
              acc.audio = true;
            }
            return acc;
          },
          { video: false, audio: false }
        );

        console.log(constraints);
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          el.srcObject = stream;
          console.log(el, stream);
        } catch (error) {
          console.error(error);
        }
      };
      initialSetup();
    }
    const handlePermissionGranted = () => {
      console.log("got permission to enter meeting");
    };
    const handlePermissionRejected = () => {
      console.log("permission not given to me");
    };
    socket.on(socketEvents.permissionGranted, handlePermissionGranted);
    socket.on(socketEvents.permissionRejected, handlePermissionRejected);

    return () => {
      socket.off(socketEvents.permissionGranted, handlePermissionGranted);
      socket.off(socketEvents.permissionRejected, handlePermissionRejected);
    };
  }, [socket]);

  const handleAskingForPermission = () => {
    if (socket.disconnected) {
      socket.connect();
    }
    // socket.emit(socketEvents.askPermission, {
    //   userId,
    // });
  };
  return (
    <div className="flex h-screen flex-col lg:flex-row">
      <div className="grid flex-1 place-items-center p-10">
        <video
          src=""
          ref={videoRef}
          autoPlay
          muted
          controls
          playsInline
          className="aspect-video w-full"
        />
      </div>
      <div className="grid flex-1 place-items-center p-10">
        <div>
          <button
            className="
          rounded-md bg-blue-500 p-3 shadow-lg
          "
          >
            Ask for permisson
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitRoom;
