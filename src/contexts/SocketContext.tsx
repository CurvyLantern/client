import React, { createContext, useEffect, useRef, useState } from 'react';

import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000');

const SocketContext = createContext<{
	socket: ReturnType<typeof io> | null;
}>({
	socket: null,
});

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
	return (
		<SocketContext.Provider
			value={{
				socket,
			}}>
			{children}
		</SocketContext.Provider>
	);
};
export { SocketProvider, SocketContext };
