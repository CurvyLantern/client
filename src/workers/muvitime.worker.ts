import pi from 'src/utils/pi';

addEventListener('message', (event: MessageEvent<number>) => {
	postMessage(pi(event.data));
});
