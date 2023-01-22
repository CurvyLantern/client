import React, { createContext, useEffect, useRef, useState } from 'react';

import { io } from 'socket.io-client';



const SocketContext = createContext<{
	socket: ReturnType<typeof io> | null;
}>({
	socket: null,
});

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
	const [mySocket, setSocket] = useState<ReturnType<typeof io> | null>(null);
	useEffect(() => {
		const socket = io('https://rtc-backend.onrender.com/');
		setSocket(socket);

		return () => {
			socket.disconnect();
		};
	}, []);

	return (
		<SocketContext.Provider
			value={{
				socket: mySocket,
			}}>
			{children}
		</SocketContext.Provider>
	);
};
export { SocketProvider, SocketContext };
