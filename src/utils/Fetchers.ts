export const roomIdFetcher = async () => {
	return await (await fetch('/api/getRoomId')).json();
};

export const checkRoomIdInServer = async (roomId: string) => {
	return (await (await fetch(`/api/checkRoomId/:${roomId}`)).json()) as 'present' | 'absent';
};
