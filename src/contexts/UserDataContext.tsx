// import { nanoid } from "nanoid";
// import React, {
//   createContext,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import { io } from "socket.io-client";

// // https:rtc-backend.onrender.com/
// type MaybeVideoEl = HTMLVideoElement | null;
// type UserVideoMapType = Map<string, MaybeVideoEl>;
// type UserVideoMapSetter = React.Dispatch<
//   React.SetStateAction<UserVideoMapType>
// >;
// type UserContextType = {
//   userId: string;
//   userVideoMap: UserVideoMapType;
//   setUserVideoMap: UserVideoMapSetter;
// };
// const UserContext = createContext<UserContextType>({
//   setUserVideoMap: () => {},
//   userId: "",
//   userVideoMap: new Map(),
// });

// const UserDataProvider = ({ children }: { children: React.ReactNode }) => {
//   const [userId] = useState(() => nanoid());
//   const [userVideoMap, setUserVideoMap] = useState<UserVideoMapType>(new Map());

//   return (
//     <UserContext.Provider
//       value={{
//         userId,
//         userVideoMap,
//         setUserVideoMap,
//       }}
//     >
//       {children}
//     </UserContext.Provider>
//   );
// };
// export { UserDataProvider, UserContext };
export {};
