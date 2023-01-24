import { Skeleton } from '@mantine/core';
import React, { useRef, useEffect } from 'react';
import videojs, { VideoJsPlayerOptions, VideoJsPlayer } from 'video.js';
import 'video.js/dist/video-js.css';

export const VideoJS = ({
	onReady,
	visible = true,
	...options
}: VideoJsPlayerOptions & {
	onReady: (player: VideoJsPlayer) => void;
	visible?: boolean;
}) => {
	const videoRef = useRef<HTMLDivElement>(null);
	const playerRef = useRef<VideoJsPlayer | null>();

	useEffect(() => {
		// Make sure Video.js player is only initialized once
		if (!playerRef.current) {
			const videoElement = document.createElement('video-js');
			videoElement.classList.add('vjs-big-play-centered');
			if (videoRef.current) {
				// The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
				videoRef.current.appendChild(videoElement);
			}

			playerRef.current = videojs(videoElement, options, () => {
				onReady && onReady(player);
			});
			const player = playerRef.current;

			// You could update an existing player in the `else` block here
			// on prop change, for example:
		} else {
			const player = playerRef.current;
			if (options && options.autoplay && options.sources) {
				player.autoplay(options.autoplay);
				player.src(options.sources);
			}
		}
	}, [options, videoRef, onReady]);

	// Dispose the Video.js player when the functional component unmounts
	React.useEffect(() => {
		const player = playerRef.current;

		return () => {
			if (player && !player.isDisposed()) {
				player.dispose();
				playerRef.current = null;
			}
		};
	}, [playerRef]);

	return (
		<>
			<Skeleton visible={!visible} animate={true} />
			<div
				style={{
					visibility: visible ? 'visible' : 'hidden',
				}}
				data-vjs-player
				ref={videoRef}></div>
			;
		</>
	);
};
