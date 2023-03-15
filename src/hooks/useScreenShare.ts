// import { useMainStore } from "@/store/BaseStore";
// import { updateNotification } from "@mantine/notifications";
// import { useEffect } from "react";

// const socketEvents = {
//   join: "join-room",
//   joined: "joined-room",
//   friendJoined: "friend-joined-room",
//   receive: "create-receive-peer",
//   sendSignal: "send-signal-to-friend",
//   receiveSignal: "receive-signal-from-friend",
//   friendLogout: "friend-logged-out",
// };
// let room_noti_id = "room-notification";

// const useScreenShare = () => {
//   const { socket, userId } = useMainStore((state) => state);

//   useEffect(() => {
//     socket.connect();

//     socket.emit(socketEvents.join);
//     const joinedListener = (roomId: string) => {
//       updateNotification({
//         id: room_noti_id,
//         message: "",
//         title: "Joined room",
//         autoClose: 5000,
//         color: "blue",
//         disallowClose: true,
//       });
//     };
//     socket.on(socketEvents.joined, joinedListener);

//     return () => {
//       socket.off(socketEvents.joined, joinedListener);
//       socket.disconnect();
//     };
//   }, [socket]);
// };

// export default useScreenShare;
export {};
