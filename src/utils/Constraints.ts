export const audioConstraints = {
  echoCancellation: false,
  noiseSuppression: false,
  channelCount: 1,
  sampleRate: 500,
  sampleSize: 8,
  autoGainControl: false,
  suppressLocalAudioPlayback: true,
};

export const videoConstraints = {
  height: 720,
  aspectRatio: 16 / 9,
  frameRate: 30,
  // resizeMode: 'none',
};
