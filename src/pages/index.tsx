import {
	AspectRatio,
	Button,
	Center,
	Container,
	Flex,
	Grid,
	Modal,
	Skeleton,
	Text,
	TextInput,
	useMantineTheme,
} from '@mantine/core';
import { getCookie, setCookie } from 'cookies-next';
import { nanoid } from 'nanoid';
import { GetServerSideProps } from 'next';
import { useCallback, useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { ManagerOptions, Socket, SocketOptions, io } from 'socket.io-client';

interface IndexPageProps {
	userId: string;
}

const IndexPage = ({ userId }: IndexPageProps) => {
	const [roomCode, setRoomCode] = useState('');
	const [openModal, setOpenModal] = useState(false);
	const [isHosting, setIsHosting] = useState(false);
	const [roomId, setRoomId] = useState('');
	const theme = useMantineTheme();
	const hostedStream = useRef<MediaStream>();
	const [hasVideo, setHasVideo] = useState(false);

	//refs
	const myVideoRef = useRef<HTMLVideoElement>(null);
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

	const initSocket = useCallback(
		({ auth, ...opts }: Partial<ManagerOptions & SocketOptions>): Promise<Socket> => {
			return new Promise((resolve, reject) => {
				if (socket) {
					resolve(socket);
					return;
				}
				const s = io(
					process.env.NEXT_PUBLIC_VERCEL_ENV === 'development'
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
		[socket]
	);
	const getStream = async () => {
		try {
			const curStream = await window.navigator.mediaDevices.getDisplayMedia({
				audio: true,
				video: {
					frameRate: 60,
				},
			});
			//@ts-ignore
			curStream.oninactive = handleCancelHost;
			hostedStream.current = curStream;
			return curStream;
		} catch (error) {
			return null;
		}
	};

	const createHostPeer = () => {
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream: hostStreamRef.current,
			config: {
				iceServers: [
					{
						urls: 'stun:openrelay.metered.ca:80',
					},
					{
						urls: 'turn:openrelay.metered.ca:80',
						username: 'openrelayproject',
						credential: 'openrelayproject',
					},
					{
						urls: 'turn:openrelay.metered.ca:443',
						username: 'openrelayproject',
						credential: 'openrelayproject',
					},
					{
						urls: 'turn:openrelay.metered.ca:443?transport=tcp',
						username: 'openrelayproject',
						credential: 'openrelayproject',
					},
				],
			},
		});

		return peer;
	};
	const createRoomId = (len: number) => {
		return nanoid(len);
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
		if (!window.isSecureContext) return;

		try {
			const stream = await getStream();
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
				console.log('new user joined');
				const newHostPeer = createHostPeer();
				newHostPeer.on('signal', data => {
					sock.emit('client:connect-from-host', {
						userId,
						signal: data,
						roomId,
					});
				});

				hostPeers.set(userId, {
					peer: newHostPeer,
					used: true,
				});
				setHostPeers(new Map(hostPeers));
			});

			// when client tries to connect with me
			sock.on('host:on-client-connect', ({ signal, userId }) => {
				console.log('this thing should be executed only once');
				if (hostPeers.has(userId)) {
					const Value = hostPeers.get(userId)!;

					Value.peer.signal(signal);
				}
			});

			setIsHosting(true);
		} catch (error) {}
	};

	const handleJoinRoom = () => {
		setOpenModal(true);
	};

	const [isReceiving, setReceiving] = useState(false);
	const receivePeerRef = useRef<Peer.Instance>();
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
				console.log(signal, 'signal-from-host');
				const receivePeer = new Peer({
					initiator: false,
					trickle: false,
					config: {
						iceServers: [
							{
								urls: 'stun:openrelay.metered.ca:80',
							},
							{
								urls: 'turn:openrelay.metered.ca:80',
								username: 'openrelayproject',
								credential: 'openrelayproject',
							},
							{
								urls: 'turn:openrelay.metered.ca:443',
								username: 'openrelayproject',
								credential: 'openrelayproject',
							},
							{
								urls: 'turn:openrelay.metered.ca:443?transport=tcp',
								username: 'openrelayproject',
								credential: 'openrelayproject',
							},
						],
					},
				});
				receivePeerRef.current = receivePeer;

				receivePeer.on('stream', curStream => {
					if (!hasVideo) {
						setHasVideo(true);
					}
					myVideoRef.current!.srcObject = curStream;
					// if (myVideoRef.current) {
					// }
				});

				receivePeer.on('signal', data => {
					console.log('sending signal to host', roomId, 'roomId', roomCode);
					s.emit('connect-with-host', {
						socketId: s.id,
						signal: data,
						userId,
						roomId: roomCode,
					});
				});
				receivePeer.signal(signal);
				setReceiving(true);
			});

			setRoomCode('');
			setOpenModal(false);
		} catch (error) {
			console.error(error);
		}
	};

	const handleStopWatching = () => {
		if (socket) {
			socket.emit('leave-room', { roomId });
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
			<Container>
				<Center className='h-screen '>
					<Grid gutter={'md'} className='w-full'>
						<Grid.Col span={12}>
							<AspectRatio ratio={16 / 9}>
								<video
									style={{
										display: hasVideo ? 'block' : 'none',
									}}
									ref={myVideoRef}
									playsInline></video>

								<Skeleton visible={!hasVideo} animate={false}></Skeleton>
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
											handleHost();
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
				opened={openModal}
				onClose={() => setOpenModal(false)}
				overlayOpacity={0.7}
				overlayBlur={3}
				overlayColor={theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[2]}>
				<Flex direction={'column'} rowGap={30}>
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

// const Temp = () => {
// 	return (
// 		<>
// 			<Title align='center' className='text-white' size={40} order={1}>
// 				{isSecured}
// 			</Title>
// 			<Container size='sm'>
// 				<AspectRatio ratio={16 / 9}>
// 					<video ref={myStream} playsInline muted autoPlay controls />
// 				</AspectRatio>
// 				<Text> Other people</Text>
// 				<AspectRatio ratio={16 / 9}>
// 					<video ref={foreignStream} playsInline muted autoPlay controls />
// 				</AspectRatio>
// 				<Text> Canvas people</Text>
// 				<AspectRatio ratio={16 / 9}>
// 					<img ref={foreignImg} />
// 				</AspectRatio>
// 			</Container>
// 			<Button onClick={() => handleStart()}>Start Share</Button>
// 			<Button onClick={() => handleStop()}>Stop Share</Button>

// 			<Container>
// 				<Paper>
// 					<TextInput value={chat} onChange={evt => setChat(evt.target.value)} />
// 					<Button onClick={() => sendText(chat)}></Button>
// 				</Paper>

// 				<List>
// 					{list.map((l, idx) => (
// 						<List.Item key={idx}>{l}</List.Item>
// 					))}
// 				</List>
// 			</Container>
// 		</>
// 	);
// };

export default IndexPage;
