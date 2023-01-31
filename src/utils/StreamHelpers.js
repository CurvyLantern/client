const dumpOptionsInfo = stream => {
	if (process.env.NODE_ENV === 'production') return;
	const tracks = stream.getTracks();

	if (!tracks) return;
  let count = 1;
	for (let track of tracks) {
    const sett = track.getSettings();
		const cons = track.getConstraints();

		console.log({
			sett,
			cons,
			count,
		});

		count++;
	}
};

const getStream = async (options, onInactive) => {
	try {
		const curStream = await window.navigator.mediaDevices.getDisplayMedia(options);
		curStream.oninactive = onInactive;

		// const videoTrack = await curStream.getVideoTracks()[0];
		// const audioTrack = await curStream.getAudioTracks()[0];
		// console.log({ videoTrack, audioTrack });

		dumpOptionsInfo(curStream);
		return curStream;
	} catch (error) {
		console.error(error);
	}
};

export { getStream };
