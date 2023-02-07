import { useActionStore } from "@/store/ActionStore";
import { HostCallStreamType, MaybeStream } from "@/types";
import { audioConstraints } from "@/utils/Constraints";
import { Button } from "@mantine/core";
import { IconMicrophoneOff, IconMicrophone } from "@tabler/icons-react";

interface ActionMicInterface {
  hostCallStream: HostCallStreamType;
  addCallStream: (stream: MaybeStream) => void;
}
const ActionMic = ({ hostCallStream, addCallStream }: ActionMicInterface) => {
  const callMuted = useActionStore((state) => state.callMuted);
  const setMuteMode = useActionStore((state) => state.setMuteMode);
  const isInCall = useActionStore((state) => state.isInCall);
  const setIsInCall = useActionStore((state) => state.setIsInCall);

  const startCall = async () => {
    if (isInCall) return false;
    setIsInCall(true);
    try {
      const callStream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
        video: false,
      });

      if (callStream) {
        // for cancelling later
        hostCallStream.current = callStream;

        addCallStream(callStream);
      }
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const muteAudio = (state: boolean = false) => {
    return new Promise((resolve) => {
      setMuteMode(state);
      const callAudioTracks = hostCallStream.current?.getAudioTracks();
      if (callAudioTracks && callAudioTracks.length > 0) {
        for (let track of callAudioTracks) {
          track.enabled = state;
        }
        resolve(true);
      }
    });
  };

  const handleMute = () => {
    console.log("muting");
    muteAudio(true);
  };

  const handleUnMute = () => {
    console.log("un muting");
    startCall();
    if (!isInCall) {
      muteAudio(false);
    }
  };
  if (callMuted) {
    return (
      <Button
        onClick={() => {
          handleUnMute();
        }}
        className={`flex items-center justify-center rounded-full bg-neutral-800 text-red-500`}
      >
        <IconMicrophoneOff />
      </Button>
    );
  } else {
    return (
      <Button
        onClick={() => {
          handleMute();
        }}
        className={`flex items-center justify-center rounded-full bg-neutral-800 text-green-500 `}
      >
        <IconMicrophone />
      </Button>
    );
  }
};

export { ActionMic };
