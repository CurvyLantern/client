import { type Socket } from 'socket.io-client';
import Peer from 'simple-peer';
import { mine, open } from '@/ICE';
import { customAlphabet } from 'nanoid';

type MaybeSocket = Socket | undefined;



const createHostPeer = (stream: MediaStream) => {
	return new Promise<Peer.Instance>(resolve => {
		const peer = new Peer({
			initiator: true,
			trickle: true,
			stream: stream,
			iceCompleteTimeout: 10000,
			config: {
				iceServers: [...mine.iceServers],
				iceTransportPolicy: 'all',
				bundlePolicy: 'balanced',
			},
		});
		resolve(peer);
	});
};

const leaveRoom = ({ roomId, socket, userId }: { socket: MaybeSocket; roomId: string; userId: string }) => {
	return new Promise<string>((resolve, reject) => {
		if (socket) {
			socket.emit('leave-room', { roomId, userId });
			socket.disconnect();
			resolve('disconnected from socket');
		} else {
			reject('no sockets available');
		}
	});
};
const DestroyPeer = (peer?: Peer.Instance) => {
	if (peer) {
		peer.destroy();
	}
};

const dividestring = (str: string, K: number) => {
	let N = str.length;
	let j = 0,
		i = 0;
	let result = [];
	let res = '';
	while (j < N) {
		res += str[j];
		if (res.length == K) {
			result.push(res);
			res = '';
		}
		j++;
	}

	if (res != '') {
		result.push(res);
	}
	return result;
};
const customNano = () => {
	const pre = customAlphabet('abcdefghijklmnopqrstuvwxyz'.toUpperCase(), 9);
	return dividestring(pre(), 3).join('-');
};
const createRoomId = (len: number) => {
	// return nanoid(len);
	return customNano();
};

export { createHostPeer, createRoomId, DestroyPeer, leaveRoom };
