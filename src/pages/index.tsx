import { SocketContext } from '@/contexts/SocketContext';
import { StreamContext } from '@/contexts/StreamContext';
import { TextInput, Text, AspectRatio, Button, Container, Paper, List, Alert, Title } from '@mantine/core';
import { forwardRef, useContext, useEffect, useRef, useState } from 'react';

const IndexPage = () => {
	const { foreignStream, myStream, startShare, stopShare } = useContext(StreamContext);
	const [list, setList] = useState<string[]>([]);
	const { socket } = useContext(SocketContext);
	const [chat, setChat] = useState('');

	const [isSecured, setIsSecured] = useState<string>('Dangerous');

	const handleStart = () => {
		startShare();
	};

	const handleStop = () => {
		stopShare();
	};

	useEffect(() => {
		const txt = window.isSecureContext ? 'Secured' : 'Dangerous';
		setIsSecured(txt);
	}, []);

	useEffect(() => {
		const testFn = (txt: string) => {
			setList(prev => [...prev, txt]);
		};
		socket?.on('test2', testFn);
		return () => {
			socket?.removeListener('test2', testFn);
		};
	}, [socket]);

	const sendText = (txt: string) => {
		socket?.emit('test', txt);
		setChat('');
	};
	return (
		<main>
			<Title align='center' className='text-white' size={40} order={1}>
				{isSecured}
			</Title>
			<Container size='sm'>
				<AspectRatio ratio={16 / 9}>
					<video ref={myStream} playsInline muted autoPlay controls />
				</AspectRatio>
				<Text> Other people</Text>
				<AspectRatio ratio={16 / 9}>
					<video ref={foreignStream} playsInline muted autoPlay controls />
				</AspectRatio>
			</Container>
			<Button onClick={() => handleStart()}>Start Share</Button>
			<Button onClick={() => handleStop()}>Stop Share</Button>

			<Container>
				<Paper>
					<TextInput value={chat} onChange={evt => setChat(evt.target.value)} />
					<Button onClick={() => sendText(chat)}></Button>
				</Paper>

				<List>
					{list.map((l, idx) => (
						<List.Item key={idx}>{l}</List.Item>
					))}
				</List>
			</Container>
		</main>
	);
};

export default IndexPage;
