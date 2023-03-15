export {};
// import { UserContext } from "@/contexts/UserDataContext";
// import { initSocket } from "@/utils/Helpers";
// import { nanoid } from "nanoid";
// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import { io } from "socket.io-client";

// const SocketContext = createContext<{
//   socket: ReturnType<typeof io> | null;
// }>({
//   socket: null,
// });
// // https:rtc-backend.onrender.com/
// const SocketProvider = ({ children }: { children: React.ReactNode }) => {
//   const { userId } = useContext(UserContext);
//   const mySocket = useMemo(() => initSocket(userId), [userId]);

//   useEffect(() => {}, []);

//   return (
//     <SocketContext.Provider
//       value={{
//         socket: mySocket,
//       }}
//     >
//       {children}
//     </SocketContext.Provider>
//   );
// };
// export { SocketProvider, SocketContext };
