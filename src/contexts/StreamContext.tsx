import { SocketContext } from '@/contexts/SocketContext';
import React, { useContext, createContext, useEffect, useRef, useState, createElement } from 'react';
import { nanoid } from 'nanoid';
import Peer from 'simple-peer';
import { Socket } from 'socket.io-client';

const StreamContext = createContext<{
	myStream: React.RefObject<HTMLVideoElement>;
	foreignStream: React.RefObject<HTMLVideoElement>;
	foreignImg: React.RefObject<HTMLImageElement>;
	startShare: () => Promise<void>;
	stopShare: () => Promise<void>;
}>({} as any);

type NullableMediaStream = MediaStream | null;

const StreamProvider = ({ children }: { children: React.ReactNode }) => {
	const myStream = useRef<HTMLVideoElement>(null);
	const foreignStream = useRef<HTMLVideoElement>(null);
	const foreignImg = useRef<HTMLImageElement>(null);
	const rafId = useRef(0);

	const { socket } = useContext(SocketContext);
	const [canvas, setCanvas] = useState<HTMLCanvasElement>();

	useEffect(() => {
		const c = document.createElement('canvas');
		c.width = 1000;
		c.height = 1000;
		setCanvas(c);
	}, []);

	useEffect(() => {
		if (!socket) return;
		socket.on('manual-receive', dataUrl => {
			if (foreignImg.current) {
				foreignImg.current.src = dataUrl;
			}
		});
		
		return () => {
			if(!socket) return
			socket.disconnect()
		}
	}, [socket]);

	const stopShare = async () => {
		window.cancelAnimationFrame(rafId.current);
	};

	const getStream = async () => {
		const stream = await window.navigator.mediaDevices.getDisplayMedia({
			audio: true,
			video: {
				frameRate: 60,
			},
		});
		// @ts-ignore
		stream.oninactive = () => {
			console.log('stream Ended');
			stopShare();
		};
		return stream;
	};

	const startShare = async () => {
		if (canvas && window.isSecureContext && myStream.current && socket) {
			const stream = await getStream();
			myStream.current.srcObject = stream;
			const ctx = canvas.getContext('2d')!;

			const loop = (timestamp: number) => {
				if (!myStream.current) return;
				ctx.drawImage(myStream.current, 0, 0, canvas.width, canvas.height);
				socket.emit('manual-stream', canvas.toDataURL('image/png', 0.7));

				rafId.current = window.requestAnimationFrame(loop);
			};
			rafId.current = window.requestAnimationFrame(loop);
		}
	};

	return (
		<StreamContext.Provider
			value={{
				myStream,
				foreignStream,
				foreignImg,
				startShare,
				stopShare,
			}}>
			{children}
		</StreamContext.Provider>
	);
};

export { StreamProvider, StreamContext };



// const StreamProvider = ({ children }: { children: React.ReactNode }) => {
// 	const myStream = useRef<any>();
// 	const foreignStream = useRef<any>();

// 	const { socket } = useContext(SocketContext);

// 	function dumpOptionsInfo() {
// 		const videoTrack = (myStream.current!.srcObject as unknown as MediaStream)?.getVideoTracks()[0];
// 		if (!videoTrack) return;

// 		console.info('Track settings:');
// 		console.info(JSON.stringify(videoTrack.getSettings(), null, 2));
// 		console.info('Track constraints:');
// 		console.info(JSON.stringify(videoTrack.getConstraints(), null, 2));
// 	}

// 	const myPeer = useRef<Peer.Instance>();
// 	const isSending = useRef(false);

// 	useEffect(() => {
// 		if (!socket) return;

// 		socket.on('receive', ({ signal }) => {
// 			if (!myPeer.current) {
// 				myPeer.current = new Peer({
// 					initiator: false,
// 					trickle: false,
// 				});
// 			}
// 			if (!isSending.current) {
// 				myPeer.current.on('stream', curStream => {
// 					if (!foreignStream.current) return;
// 					foreignStream.current.srcObject = curStream;
// 				});

// 				myPeer.current.on('signal', data => {
// 					socket.emit('signal', { signal: data });
// 				});
// 			}
// 			myPeer.current.signal(signal);

// 			console.log('receiving');
// 		});
// 		socket.on('share-end', () => {
// 			myPeer.current?.destroy();
// 		});
// 	}, [socket]);

// 	const startShare = async () => {
// 		try {
// 			if (!myStream) return;
// 			const mediaStream = await window.navigator.mediaDevices.getDisplayMedia({
// 				audio: true,
// 				video: {
// 					frameRate: 60,
// 				},
// 			});
// 			myStream.current.srcObject = mediaStream;

// 			// create a new peer
// 			// and store that peer
// 			myPeer.current = new Peer({
// 				initiator: true,
// 				trickle: false,
// 				stream: mediaStream,
// 			});

// 			myPeer.current.on('signal', signal => {
// 				socket?.emit('signal', { signal });
// 			});
// 			isSending.current = true;
// 			console.log('sending');

// 			console.log(myStream);

// 			// dumpOptionsInfo();
// 		} catch (error) {
// 			console.error(`Error ${error}`);
// 		}
// 	};
// 	const stopShare = async () => {
// 		let tracks = (myStream.current?.srcObject as unknown as MediaStream)?.getTracks();

// 		tracks?.forEach(track => track.stop());
// 		myStream.current!.srcObject = null;
// 	};

// 	return (
// 		<StreamContext.Provider
// 			value={{
// 				myStream,
// 				startShare,
// 				stopShare,
// 				foreignStream,
// 			}}>
// 			{children}
// 		</StreamContext.Provider>
// 	);
// };

