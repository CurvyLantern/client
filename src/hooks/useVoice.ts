import { useBoundStore } from "@/store";
import { getUserStream } from "@/utils/StreamHelpers";
import { useCallback, useEffect, useState } from "react";

const useVoice = () => {
  const [error, setError] = useState(null);
  const peerMap = useBoundStore((s) => s.peerMap);
  const [voiceStream, setVoiceStream] = useState<MediaStream | null>(null);

  const stopVoice = useCallback(() => {
    if (voiceStream) {
      peerMap.forEach((peer) => {
        peer.removeStream(voiceStream);
      });
    }
    setVoiceStream(null);
  }, [peerMap, voiceStream]);

  const muteOrUnmuteVoice = useCallback(
    (mode: "mute" | "unmute") => {
      voiceStream?.getTracks().forEach((track) => {
        if (track.kind === "audio" && track.readyState === "live") {
          track.enabled = mode !== "mute";
        }
      });
    },
    [voiceStream]
  );

  const startVoice = useCallback(async () => {
    const voiceStream = await getUserStream({ audio: true }, () => {});
    setVoiceStream(voiceStream);
  }, []);

  useEffect(() => {
    peerMap.forEach((peer) => {
      if (voiceStream) {
        peer.addStream(voiceStream);
      }
    });
  }, [peerMap, voiceStream]);

  return {
    stopVoice,
    muteOrUnmuteVoice,
    startVoice,
  };
};

export default useVoice;
