export const audioConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  channelCount: 1,
  sampleRate: 100,
  sampleSize: 2,
  autoGainControl: true,
  suppressLocalAudioPlayback: true,
};

export const videoConstraints = {
  height: 720,
  aspectRatio: 16 / 9,
  frameRate: 30,
  // resizeMode: 'none',
};
