export const audioConstraints = {
  echoCancellation: false,
  noiseSuppression: false,
  channelCount: 2,
  sampleRate: 600,
  sampleSize: 8,
  autoGainControl: false,
  suppressLocalAudioPlayback: true,
};

export const videoConstraints: MediaTrackConstraints = {
  // height: 720,
  // aspectRatio: 16 / 9,
  frameRate: 30,
  // resizeMode: 'none',
};
