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

const getStream = async (options: any, onInactive: any) => {
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
const getVideoStream = (stream?: MediaStream | null) => {
  if (!stream) throw new Error("no stream provided");
  const videoTrack = stream.getVideoTracks();
  return new MediaStream(videoTrack!);
};

export { getStream, getVideoStream };
