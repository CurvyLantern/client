import { type Socket } from 'socket.io-client';
import Peer from 'simple-peer';
import { mine, open } from '@/ICE';
import { customAlphabet } from 'nanoid';

type MaybeSocket = Socket | undefined;

const getStream = async ({
	frameRate = 30,
	systemAudio = false,
	onInactive,
}: {
	systemAudio: boolean;
	onInactive: () => void;
	frameRate: number;
}) => {
	try {
		const curStream = await window.navigator.mediaDevices.getDisplayMedia({
			audio: {
				echoCancellation: true,
				noiseSuppression: true,
				//@ts-ignore
				latency: 150,
				// channelCount: 1,
				frameRate,
				sampleRate: 6000,
				sampleSize: 8,
				autoGainControl: false,
				//@ts-ignore
				suppressLocalAudioPlayback: true,
			},
			video: {
				height: 720,
				aspectRatio: 16 / 9,
				frameRate,
			},
			//@ts-ignore
			surfaceSwitching: 'include',
			//@ts-ignore
			systemAudio: systemAudio ? 'include' : 'exclude',
		});
		//@ts-ignore
		curStream.oninactive = onInactive;
		dumpOptionsInfo(curStream);
		return curStream;
	} catch (error) {
		console.error(error);
	}
};

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

const dumpOptionsInfo = (stream: MediaStream) => {
	if (process.env.NODE_ENV === 'production') return;
	const tracks = stream.getTracks();

	if (!tracks) return;
	for (let track of tracks) {
		console.info('Track settings:');
		console.info(JSON.stringify(track.getSettings(), null, 2));
		console.info('Track constraints:');
		console.info(JSON.stringify(track.getConstraints(), null, 2));
	}
};

export { getStream, createHostPeer, createRoomId, DestroyPeer, leaveRoom, dumpOptionsInfo };
