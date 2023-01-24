export const mine = {
	iceServers: [
		{
			urls: 'stun:relay.metered.ca:80',
		},
		{
			urls: 'turn:relay.metered.ca:80',
			username: '037a8fc4651c1e8d0318c4ae',
			credential: 'Gb60MOmhys8swcID',
		},
		{
			urls: 'turn:relay.metered.ca:443',
			username: '037a8fc4651c1e8d0318c4ae',
			credential: 'Gb60MOmhys8swcID',
		},
		{
			urls: 'turn:relay.metered.ca:443?transport=tcp',
			username: '037a8fc4651c1e8d0318c4ae',
			credential: 'Gb60MOmhys8swcID',
		},
	],
} as const;
export const open = {
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
} as const;
