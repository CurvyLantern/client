import { MaybeStream } from "@/types";
import { useEffect, useRef, useState } from "react";

interface ActiveMediaUsersProps {
  stream: MaybeStream;
}
const ActiveMediaUsers: React.FC<ActiveMediaUsersProps> = ({ stream }) => {
  const videoEl = useRef<HTMLVideoElement>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [hasScreenStream, setHasScreenStream] = useState(false);
  const [screenStream, setScreenStream] = useState<MaybeStream>(null);
  const [voiceStream, setVoiceStream] = useState<MaybeStream>(null);
  const audioEl = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setScreenStream(new MediaStream());
    setVoiceStream(new MediaStream());
  }, []);

  useEffect(() => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        if (screenStream) screenStream.addTrack(track);
      });
      stream.getAudioTracks().forEach((track) => {
        if (voiceStream) voiceStream.addTrack(track);
      });
    }

    const handler = (e: MediaStreamTrackEvent) => {
      console.log("media stream added", e);
    };
    stream?.addEventListener("addtrack", handler);
    return stream?.removeEventListener("addtrack", handler);
  }, [stream, screenStream, voiceStream]);

  useEffect(() => {
    const match = stream instanceof MediaStream;
    setHasScreenStream(match);
  }, [stream]);
  useEffect(() => {
    if (hasScreenStream && isWatching && videoEl.current) {
      const el = videoEl.current;
      el.srcObject = stream;

      return () => {
        if (el) {
          el.srcObject = null;
        }
      };
    }
  }, [isWatching, stream, hasScreenStream]);

  useEffect(() => {
    const vidEl = videoEl.current;
    const audEl = audioEl.current;

    if (vidEl) {
      vidEl.srcObject = screenStream;
    }
    if (audEl) {
      audEl.srcObject = voiceStream;
    }
    return () => {
      if (vidEl) {
        vidEl.srcObject = null;
      }
      if (audEl) {
        audEl.srcObject = null;
      }
    };
  }, [voiceStream, screenStream]);

  return (
    <div className="flex flex-col">
      <audio ref={audioEl} autoPlay controls className="w-full"></audio>
      <div className="flex aspect-9/12 w-56 min-w-[200px] items-center justify-center overflow-hidden rounded-xl bg-gray-600">
        {hasScreenStream ? (
          <>
            {isWatching ? (
              <video
                ref={videoEl}
                autoPlay
                controls
                playsInline
                className="max-w-full"
              />
            ) : (
              <button
                onClick={() => {
                  setIsWatching(true);
                }}
                className="rounded-full border-0 px-5 py-3 text-xl shadow-md outline-transparent"
              >
                watch stream
              </button>
            )}
          </>
        ) : (
          <ActiveUserProfile />
        )}
      </div>
    </div>
  );
};
const ActiveUserProfile = () => {
  return <div className="aspect-square w-1/3 rounded-full bg-red-300"></div>;
};
export default ActiveMediaUsers;
