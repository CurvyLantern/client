import { MaybeStream } from "@/types";

const dumpOptionsInfo = (stream: MediaStream) => {
  if (process.env.NODE_ENV === "production") return;
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

export const isStream = (object: unknown) => {
  return Boolean(object) && object instanceof MediaStream;
};

export const getDisplayStream = async (options: any, onInactive: any) => {
  try {
    const curStream = await window.navigator.mediaDevices.getDisplayMedia(
      options
    );
    // @ts-ignore
    curStream.oninactive = onInactive;

    dumpOptionsInfo(curStream);
    return curStream;
  } catch (error) {
    throw error;
  }
};
export const getUserStream = async (options: any, onInactive: any) => {
  try {
    const curStream = await window.navigator.mediaDevices.getUserMedia(options);
    // @ts-ignore
    curStream.oninactive = onInactive;

    dumpOptionsInfo(curStream);
    return curStream;
  } catch (error) {
    throw error;
  }
};
export const streamFromTracks = (tracks: MediaStreamTrack[]) => {
  const stream = new MediaStream();
  tracks.forEach((track) => {
    stream.addTrack(track);
  });
  return stream;
};
export const getVideoStream = (stream?: MediaStream | null) => {
  if (stream) {
    return streamFromTracks(stream.getVideoTracks());
  }
  throw new Error("no stream provided");
};
export const getAudioStream = (stream: MaybeStream) => {
  if (stream) {
    return streamFromTracks(stream.getAudioTracks());
  }
  throw new Error("no stream provided");
};

export const stopStream = (stream: MediaStream | null) => {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    track.stop();
  });
};
