const dumpOptionsInfo = stream => {
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

const getStream = async ({ showCursor = false, frameRate = 30, systemAudio = false, onInactive }) => {
	try {
		const curStream = await window.navigator.mediaDevices.getDisplayMedia({
			audio: {
				echoCancellation: true,
				noiseSuppression: true,
				latency: 150,
				// channelCount: 1,
				frameRate,
				sampleRate: 6000,
				sampleSize: 8,
				autoGainControl: false,
				suppressLocalAudioPlayback: true,
			},
			video: {
				cursor: showCursor ? 'always' : 'never',
				height: 720,
				aspectRatio: 16 / 9,
				frameRate,
			},
			surfaceSwitching: 'include',
			systemAudio: systemAudio ? 'include' : 'exclude',
			selfBrowserSurface: 'exclude',
			restrictOwnAudio: true,
		});
		curStream.oninactive = onInactive;

		const videoTrack = await curStream.getVideoTracks()[0];
		const audioTrack = await curStream.getAudioTracks()[0];
		console.log({ videoTrack, audioTrack });

		return curStream;
	} catch (error) {
		console.error(error);
	}
};

export { getStream };
