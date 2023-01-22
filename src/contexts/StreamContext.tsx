import { SocketContext } from '@/contexts/SocketContext';
import React, { useContext, createContext, useEffect, useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import Peer from 'simple-peer';

const StreamContext = createContext<{
	myStream: React.RefObject<any>;
	foreignStream: React.RefObject<any>;
	startShare: () => Promise<void>;
	stopShare: () => Promise<void>;
}>({} as any);

type NullableMediaStream = MediaStream | null;

const StreamProvider = ({ children }: { children: React.ReactNode }) => {
	const myStream = useRef<any>();
	const foreignStream = useRef<any>();

	const { socket } = useContext(SocketContext);

	function dumpOptionsInfo() {
		const videoTrack = (myStream.current!.srcObject as unknown as MediaStream)?.getVideoTracks()[0];
		if (!videoTrack) return;

		console.info('Track settings:');
		console.info(JSON.stringify(videoTrack.getSettings(), null, 2));
		console.info('Track constraints:');
		console.info(JSON.stringify(videoTrack.getConstraints(), null, 2));
	}

	const myPeer = useRef<Peer.Instance>();
	const isSending = useRef(false);

	useEffect(() => {
		if (!socket) return;

		socket.on('receive', ({ signal }) => {
			if (!myPeer.current) {
				myPeer.current = new Peer({
					initiator: false,
					trickle: false,
				});
			}
			if (!isSending.current) {
				myPeer.current.on('stream', curStream => {
					if (!foreignStream.current) return;
					foreignStream.current.srcObject = curStream;
				});

				myPeer.current.on('signal', data => {
					socket.emit('signal', { signal: data });
				});
			}
			myPeer.current.signal(signal);

			console.log('receiving');
		});
		socket.on('share-end', () => {
			myPeer.current?.destroy();
		});
	}, [socket]);

	const startShare = async () => {
		try {
			if (!myStream) return;
			const mediaStream = await window.navigator.mediaDevices.getDisplayMedia({
				audio: true,
				video: {
					frameRate: 60,
				},
			});
			myStream.current.srcObject = mediaStream;

			// create a new peer
			// and store that peer
			myPeer.current = new Peer({
				initiator: true,
				trickle: false,
				stream: mediaStream,
			});

			myPeer.current.on('signal', signal => {
				socket?.emit('signal', { signal });
			});
			isSending.current = true;
			console.log('sending');

			console.log(myStream);

			// dumpOptionsInfo();
		} catch (error) {
			console.error(`Error ${error}`);
		}
	};
	const stopShare = async () => {
		let tracks = (myStream.current?.srcObject as unknown as MediaStream)?.getTracks();

		tracks?.forEach(track => track.stop());
		myStream.current!.srcObject = null;
	};

	return (
		<StreamContext.Provider
			value={{
				myStream,
				startShare,
				stopShare,
				foreignStream,
			}}>
			{children}
		</StreamContext.Provider>
	);
};
export { StreamProvider, StreamContext };
