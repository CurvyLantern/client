import {
	AspectRatio,
	Button,
	Center,
	Container,
	Flex,
	Grid,
	Modal,
	NumberInput,
	Skeleton,
	Text,
	TextInput,
	useMantineTheme,
} from '@mantine/core';
import { useFullscreen } from '@mantine/hooks';
import { getCookie, setCookie } from 'cookies-next';
import { nanoid } from 'nanoid';
import { GetServerSideProps } from 'next';
import { useCallback, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { ManagerOptions, Socket, SocketOptions, io } from 'socket.io-client';
import { customAlphabet } from 'nanoid';
import { mine, open } from '@/ICE';

function dividestring(str: string, K: number) {
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
}

const customNano = () => {
	const pre = customAlphabet('abcdefghijklmnopqrstuvwxyz'.toUpperCase(), 9);
	return dividestring(pre(), 3).join('-');
};
import { VideoJS } from '@/components/VideoJs';

interface IndexPageProps {
	userId: string;
}

const IndexPage = ({ userId }: IndexPageProps) => {
	const [roomCode, setRoomCode] = useState('');
	const [frameRate, setFrameRate] = useState<number>(0);
	const [modalState, setModalState] = useState<{
		open: boolean;
		mode: 'host' | 'client' | undefined;
	}>({
		open: false,
		mode: undefined,
	});
	const [isHosting, setIsHosting] = useState(false);
	const [roomId, setRoomId] = useState('');
	const theme = useMantineTheme();
	const hostedStream = useRef<MediaStream>();
	const [hasVideo, setHasVideo] = useState(false);

	//refs
	const myVideoRef = useRef<HTMLVideoElement>();
	const hostStreamRef = useRef<MediaStream>();
	const [socket, setSocket] = useState<Socket>();
	const [hostPeers, setHostPeers] = useState<
		Map<
			string,
			{
				peer: Peer.Instance;
				used: boolean;
			}
		>
	>(new Map());
	const [videoPlaying, setVideoPlaying] = useState(false);

	const dumpOptionsInfo = (stream: MediaStream) => {
		const tracks = stream.getTracks();

		if (!tracks) return;
		for (let track of tracks) {
			console.info('Track settings:');
			console.info(JSON.stringify(track.getSettings(), null, 2));
			console.info('Track constraints:');
			console.info(JSON.stringify(track.getConstraints(), null, 2));
		}
	};

	const initSocket = useCallback(
		({ auth, ...opts }: Partial<ManagerOptions & SocketOptions>): Promise<Socket> => {
			return new Promise((resolve, reject) => {
				if (socket) {
					resolve(socket);
					return;
				}
				const s = io(
					process.env.NODE_ENV === 'development'
						? 'http://localhost:8000'
						: 'https://rtc-backend.onrender.com/',
					{
						...opts,
						transports: ['websocket'],
						auth: {
							userId,
							...auth,
						},
						autoConnect: false,
					}
				);
				setSocket(s);
				setTimeout(() => {
					resolve(s);
				}, 200);
			});
		},
		[socket, userId]
	);
	const getStream = async ({ frameRate = 30 }: { frameRate: number }) => {
		try {
			const curStream = await window.navigator.mediaDevices.getDisplayMedia({
				audio: {
					echoCancellation: false,
					noiseSuppression: false,
					//@ts-ignore
					latency: 100,
					channelCount: 1,
					frameRate,
					sampleRate: 8000,
					sampleSize: 8,
					autoGainControl: false,
				},
				video: {
					height: 720,
					aspectRatio: 16 / 9,
					frameRate,
				},
			});
			//@ts-ignore
			curStream.oninactive = handleCancelHost;
			hostedStream.current = curStream;

			dumpOptionsInfo(curStream);

			return curStream;
		} catch (error) {
			return null;
		}
	};

	const createHostPeer = () => {
		const peer = new Peer({
			initiator: true,
			trickle: true,
			stream: hostStreamRef.current,
			iceCompleteTimeout: 10000,
			config: {
				iceServers: [...mine.iceServers],
				iceTransportPolicy: 'all',
				bundlePolicy: 'balanced',
			},
		});

		return peer;
	};
	const createRoomId = (len: number) => {
		// return nanoid(len);
		return customNano();
	};

	const handleCancelHost = () => {
		hostedStream.current?.getTracks().forEach(track => {
			track.stop();
		});
		if (myVideoRef.current) {
			myVideoRef.current.srcObject = null;
		}
		socket?.emit('host:leave-room', { roomId });
		socket?.disconnect();
		setIsHosting(false);
	};

	const handleHost = async () => {
		setModalState({
			open: false,
			mode: undefined,
		});
		if (!window.isSecureContext) return;

		try {
			const stream = await getStream({ frameRate });
			if (!stream) throw new Error('no permission given');

			hostStreamRef.current = stream;
			const sock = await initSocket({
				auth: {
					isHosting: 'yes',
				},
			});
			if (myVideoRef.current) {
				if (!hasVideo) {
					setHasVideo(true);
				}
				myVideoRef.current.srcObject = stream;
				myVideoRef.current.onloadedmetadata = () => {
					myVideoRef.current?.play();
				};
			}

			const roomId = createRoomId(8);
			setRoomId(roomId);
			sock.connect();
			sock.emit('create-room', roomId);

			// when user joins my room
			sock.on('user-joined', ({ userId, socketId, roomId }) => {
				const newHostPeer = createHostPeer();
				newHostPeer.on('signal', data => {
					sock.emit('client:connect-from-host', {
						userId,
						signal: data,
						roomId,
					});
				});
				newHostPeer.on('error', err => {
					console.log(err);
					newHostPeer.destroy();
				});
				newHostPeer.on('connect', () => {
					console.log(`host connected to ${userId}`);
				});

				hostPeers.set(userId, {
					peer: newHostPeer,
					used: true,
				});
				setHostPeers(new Map(hostPeers));
			});

			// when client tries to connect with me
			sock.on('host:on-client-connect', ({ signal, userId }) => {
				if (hostPeers.has(userId)) {
					const value = hostPeers.get(userId)!;

					value.peer.signal(signal);
				}
			});

			//when someone leaves
			sock.on('user-left', ({ socketId, userId }) => {
				if (hostPeers.has(userId)) {
					const value = hostPeers.get(userId);
					value?.peer.destroy();
					hostPeers.delete(userId);

					setHostPeers(new Map(hostPeers));
				}
			});

			setIsHosting(true);
		} catch (error) {}
	};

	const handleJoinRoom = () => {
		setModalState({
			open: true,
			mode: 'client',
		});
	};

	const [isReceiving, setReceiving] = useState(false);
	const receivePeerRef = useRef<Peer.Instance>();

	const [debug, setDebug] = useState<string[]>([]);
	const connectToRoom = async () => {
		try {
			const s = await initSocket({
				auth: {
					isHosting: 'no',
				},
			});
			s.connect();
			s.emit('user-join-room', roomCode);
			setRoomId(roomCode);

			s.on('host-left', () => {
				myVideoRef.current!.srcObject = null;
			});

			s.on('signal-from-host', ({ signal }) => {
				setDebug(prev => [...prev, 'received signal from host']);
				if (!receivePeerRef.current) {
					const receivePeer = new Peer({
						initiator: false,
						trickle: true,
						stream: hostStreamRef.current,
						iceCompleteTimeout: 10000,
						config: {
							iceServers: [...mine.iceServers],
							iceTransportPolicy: 'all',
							bundlePolicy: 'balanced',
						},
					});
					receivePeerRef.current = receivePeer;
					receivePeer.on('stream', curStream => {
						if (!hasVideo) {
							setHasVideo(true);
						}
						const temp = JSON.stringify({ strream: curStream });
						setDebug(prev => [...prev, temp]);
						hostedStream.current = curStream;
						if (myVideoRef.current) {
							setDebug(prev => [...prev, 'video exists']);
							myVideoRef.current.srcObject = curStream;
							myVideoRef.current.onloadedmetadata = () => {
								setDebug(prev => [...prev, 'video will play now']);
								myVideoRef.current?.play();
							};
						}
					});

					receivePeer.on('signal', data => {
						s.emit('connect-with-host', {
							socketId: s.id,
							signal: data,
							userId,
							roomId: roomCode,
						});
					});
					receivePeer.on('error', err => {
						console.log(err);
						receivePeer?.destroy();
					});
					receivePeer.on('connect', () => {
						console.log(`client connected to host`);
					});
					receivePeer.signal(signal);
				} else {
					receivePeerRef.current.signal(signal);
				}

				setReceiving(true);
			});

			setRoomCode('');
			setModalState({
				open: false,
				mode: undefined,
			});
			setReceiving(true);
		} catch (error) {
			console.error(error);
		}
	};

	const handleStopWatching = () => {
		if (socket) {
			socket.emit('leave-room', { roomId, userId });
			socket.disconnect();
		}
		if (receivePeerRef.current) {
			receivePeerRef.current.destroy();
		}
		if (myVideoRef.current) {
			myVideoRef.current.srcObject = null;
		}
		setReceiving(false);
		setHasVideo(false);
	};

	return (
		<main>
			<Text align='center'>{JSON.stringify(debug)}</Text>
			<Container>
				<Center className='h-screen '>
					<Grid gutter={'md'} className='w-full'>
						<Grid.Col span={12}>
							<AspectRatio ratio={16 / 9}>
								<VideoJS
									visible={hasVideo}
									responsive
									playsinline
									fill
									controls
									onReady={player => {
										const tech = player.tech();
										const el = tech.el();
										myVideoRef.current = el as HTMLVideoElement;
									}}></VideoJS>

								{/* <video
									style={{
										display: hasVideo ? 'block' : 'none',
									}}
									ref={myVideoRef}
									playsInline></video> */}
							</AspectRatio>
						</Grid.Col>
						<Grid.Col>
							<Text align='center'>room id : {roomId ? roomId : 'No room id'}</Text>
							{/* <Text align='center'>user id : {userId}</Text> */}
						</Grid.Col>

						{isHosting ? (
							<>
								<Grid.Col span={12}>
									<Button
										fullWidth
										onClick={() => {
											handleCancelHost();
										}}>
										Cancel Host
									</Button>
								</Grid.Col>
							</>
						) : isReceiving ? (
							<>
								<Grid.Col span={12}>
									<Button
										fullWidth
										onClick={() => {
											handleStopWatching();
										}}>
										Leave Room
									</Button>
								</Grid.Col>
							</>
						) : (
							<>
								<Grid.Col span={6}>
									<Button
										fullWidth
										onClick={() => {
											setModalState({
												open: true,
												mode: 'host',
											});
										}}>
										Host
									</Button>
								</Grid.Col>
								<Grid.Col span={6}>
									<Button fullWidth onClick={() => handleJoinRoom()}>
										{' '}
										Join Room{' '}
									</Button>
								</Grid.Col>
							</>
						)}
					</Grid>
				</Center>
			</Container>
			<Modal
				trapFocus
				centered
				opened={modalState.open}
				onClose={() =>
					setModalState({
						open: false,
						mode: undefined,
					})
				}
				overlayOpacity={0.7}
				overlayBlur={3}
				overlayColor={theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[2]}>
				<Flex direction={'column'} rowGap={30}>
					{modalState.mode === 'client' ? (
						<>
							<TextInput
								styles={theme => ({
									input: {
										textAlign: 'center',
									},
								})}
								size='xl'
								placeholder='Enter room code'
								className='text-center'
								value={roomCode}
								onChange={evt => setRoomCode(evt.currentTarget.value)}
							/>
							<Button variant='outline' onClick={() => connectToRoom()}>
								Proceed
							</Button>
						</>
					) : modalState.mode === 'host' ? (
						<>
							<Button variant='outline' onClick={() => setFrameRate(30)}>
								30 fps
							</Button>
							<Button variant='outline' onClick={() => setFrameRate(60)}>
								60 fps
							</Button>
							<NumberInput value={frameRate} onChange={evt => setFrameRate(Number(evt))} />
							<Button variant='outline' onClick={() => handleHost()}>
								Proceed
							</Button>
						</>
					) : null}
				</Flex>
			</Modal>
		</main>
	);
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	let userId = undefined;
	const useridInCookie = getCookie('user-id', { req, res, httpOnly: true });
	if (useridInCookie) {
		userId = useridInCookie;
	} else {
		userId = nanoid(8);
		setCookie('user-id', { req, res }, { httpOnly: true, maxAge: 60 * 60 * 24 });
	}

	return {
		props: {
			userId,
		},
	};
};



export default IndexPage;
