import { useBoundStore } from "@/store";
import { socketEvents } from "@/utils/SocketHelpers";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
const WaitRoom = () => {
  const socket = useBoundStore((state) => state.socket);
  const userId = useBoundStore((state) => state.userId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const params = useSearchParams();
  const [noMedia, setNoMedia] = useState(false);
  const router = useRouter();
  const [isAlreadyAccepted, setAlreadyAccepted] = useState(false);

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
        if (constraints.audio || constraints.video) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia(
              constraints
            );
            el.srcObject = stream;
            console.log(el, stream);
            setNoMedia(false);
          } catch (error) {
            setNoMedia(true);
            console.error(error);
          }
        } else {
          setNoMedia(true);
        }
      };
      initialSetup();
    }
  }, []);

  useEffect(() => {
    if (!router || !params) return () => {};

    console.log(socket);
    if (!socket || socket.disconnected) return;
    console.log("everything is working as expected");
    const handlePermissionGranted = () => {
      console.log("got permission to enter meeting");
      const roomId = params.get("roomId");
      router.push({
        pathname: roomId,
      });
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
  }, [socket, params, router]);

  const handleAskingForPermission = () => {
    if (!socket) {
      throw new Error("no socket defined how to ask for permission dumbass");
    }
    const roomId = params.get("roomId");

    if (!roomId) return;
    socket.emit(socketEvents.askPermission, {
      roomId,
    });
    console.log({ socket });
  };
  return (
    <div className="flex h-screen flex-col lg:flex-row">
      <div className="grid flex-1 place-items-center p-10">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-white">
          {noMedia ? (
            <div
              className="flex h-full w-full
           items-center justify-center rounded-lg 
           border-8 border-red-500 bg-red-300
           bg-opacity-80
            text-3xl font-semibold  text-red-500 "
            >
              no camera or voice input device found
            </div>
          ) : (
            <video
              src=""
              ref={videoRef}
              autoPlay
              muted
              controls
              playsInline
              className="h-full w-full"
            />
          )}
        </div>
      </div>
      <div className="grid flex-1 place-items-center p-10">
        <div>
          <button
            onClick={() => {
              handleAskingForPermission();
            }}
            className="
          rounded-md bg-blue-500 p-3 text-white
          shadow-md
          shadow-blue-800 hover:bg-blue-600
          active:scale-95
          "
          >
            Ask for permisson
          </button>
          <button
            onClick={() => {
              socket?.connect();
              console.log({ socket });
            }}
          >
            connect socket
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitRoom;
