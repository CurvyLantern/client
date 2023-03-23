import { io } from "socket.io-client";
import { isDevMode } from "./Helpers";

export const socketEvents = {
  join: "join-room",
  joined: "joined-room",
  friendJoined: "friend-joined-room",
  receive: "create-receive-peer",
  sendSignal: "send-signal-to-friend",
  receiveSignal: "receive-signal-from-friend",
  friendLogout: "friend-logged-out",
  askPermission: "asking-permission",
  permissionGranted: "permission-granted",
  permissionRejected: "permission-rejected",
} as const;
export const initSocketClient = (id: string) => {
  let url = "";
  if (isDevMode()) {
    url = "http://localhost:8000/";
  } else {
    url = process.env.NEXT_PUBLIC_SOCKET_URL2
      ? process.env.NEXT_PUBLIC_SOCKET_URL2
      : "";
  }
  return io(url, {
    transports: ["websocket"],
    autoConnect: false,
    auth: {
      userId: id,
    },
  });
};
