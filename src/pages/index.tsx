import Video from '@/components/Video';
import { SocketContext } from '@/contexts/SocketContext';
import { StreamContext } from '@/contexts/StreamContext';
import { TextInput, Text, AspectRatio, Button, Container, Paper, List } from '@mantine/core';
import { forwardRef, useContext, useEffect, useRef, useState } from 'react';

const IndexPage = () => {
	const { foreignStream, myStream, startShare, stopShare } = useContext(StreamContext);
	const [list, setList] = useState<string[]>([]);
	const { socket } = useContext(SocketContext);
	const handleStart = () => {
		startShare();
	};

	const handleStop = () => {
		stopShare();
	};

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
	};
	return (
		<main>
			<Container size='sm'>
				<AspectRatio ratio={16 / 9}>
					<video ref={myStream} playsInline muted autoPlay />
				</AspectRatio>
				<Text> Other people</Text>
				<AspectRatio ratio={16 / 9}>
					<video ref={foreignStream} playsInline muted autoPlay />
				</AspectRatio>
			</Container>
			<Button onClick={() => handleStart()}>Start Share</Button>
			<Button onClick={() => handleStop()}>Stop Share</Button>

			<Container>
				<Paper>
					<TextInput onBlur={evt => sendText(evt.target.value)} />
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
