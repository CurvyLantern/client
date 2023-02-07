import { io, type Socket } from "socket.io-client";
import Peer from "simple-peer";
import { mine, open } from "@/ICE";
import { customAlphabet, nanoid } from "nanoid";
import { getCookie, setCookie } from "cookies-next";

type MaybeSocket = Socket | undefined;

interface InitSocket extends ReturnType<typeof io> {
  auth: {
    userId: string;
  };
}
const initSocket = (id: string) => {
  // let userId = getCookie("userId");
  // if (!userId) {
  //   userId = nanoid();
  //   setCookie("userId", userId);
  // }

  return io(
    process.env.NODE_ENV === "development"
      ? "http://localhost:8000"
      : "https://rtc-backend.onrender.com/",
    {
      transports: ["websocket"],
      autoConnect: false,
      auth: {
        userId: id,
      },
    }
  );
};

const createPeer = (initiator: boolean = false, stream: MediaStream | null) => {
  const peer = new Peer({
    initiator,
    trickle: true,
    iceCompleteTimeout: 5000,
    stream: stream ? stream : undefined,
    config: {
      iceServers: [...mine.iceServers],
      iceTransportPolicy: "all",
      bundlePolicy: "balanced",
    },
  });

  return peer;
};
const leaveRoom = ({
  roomId,
  socket,
  userId,
}: {
  socket: MaybeSocket;
  roomId: string;
  userId: string;
}) => {
  return new Promise<string>((resolve, reject) => {
    if (socket) {
      socket.emit("leave-room", { roomId, userId });
      socket.disconnect();
      resolve("disconnected from socket");
    } else {
      reject("no sockets available");
    }
  });
};
const DestroyPeer = (peer?: Peer.Instance) => {
  if (peer) {
    peer.destroy();
  }
};

const stopStream = (stream: MediaStream | null) => {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    track.stop();
  });
};

const dividestring = (str: string, K: number) => {
  let N = str.length;
  let j = 0,
    i = 0;
  let result = [];
  let res = "";
  while (j < N) {
    res += str[j];
    if (res.length == K) {
      result.push(res);
      res = "";
    }
    j++;
  }

  if (res != "") {
    result.push(res);
  }
  return result;
};
const customNano = () => {
  const pre = customAlphabet("abcdefghijklmnopqrstuvwxyz".toUpperCase(), 9);
  return dividestring(pre(), 3).join("-");
};
const createRoomId = async (
  len: number,
  except: { code: string }[]
): Promise<string> => {
  const code = customNano();
  if (!except.includes({ code })) return code;
  return await createRoomId(len, except);
};

export {
  initSocket,
  stopStream,
  createPeer,
  createRoomId,
  DestroyPeer,
  leaveRoom,
};
