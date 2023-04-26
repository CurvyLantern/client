import useVoice from "@/hooks/useVoice";
import { useState } from "react";
import { IconType } from "react-icons";
import {
  TbDotsVertical,
  TbHeart,
  TbHeartBroken,
  TbMessages,
  TbMessagesOff,
  TbMicrophone,
  TbMicrophoneOff,
  TbPhoneOff,
  TbScreenShare,
  TbScreenShareOff,
  TbVideo,
  TbVideoOff,
} from "react-icons/tb";
import PopoverButton from "../popup/PopOver";
import ActionIcon from "./ActionIcon";

interface IActionBar {
  startScreenShare: () => void;
  stopScreenShare: () => void;
}
const ActionBar: React.FC<IActionBar> = ({
  startScreenShare,
  stopScreenShare,
}) => {
  const [clickedAudio, setclickedAudio] = useState(false);
  const [clickedVideo, setclickedVideo] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const { startVoice, muteOrUnmuteVoice, stopVoice } = useVoice();
  const [voiceUsedOnce, setVoiceUsedOnce] = useState(false);
  const handleClickAudio = () => {
    setclickedAudio(!clickedAudio);
    if (!voiceUsedOnce) {
      startVoice();
      setVoiceUsedOnce(true);
    } else {
      muteOrUnmuteVoice(clickedAudio ? "unmute" : "mute");
    }
  };

  // const handleClickVideo = () => {
  //   setclickedVideo(!clickedVideo);
  // };

  const handleShareScreen = () => {
    if (isSharingScreen) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
    setIsSharingScreen(!isSharingScreen);
  };
  return (
    <div className=" fixed bottom-0 left-0 flex w-full items-center justify-center bg-black  py-10">
      <div className="flex gap-2 rounded-xl bg-neutral-800 bg-opacity-70 px-10 py-4 shadow-lg backdrop-blur-md">
        {/* voice */}
        <ActionIcon
          iconPositive={TbMicrophone}
          iconNegative={TbMicrophoneOff}
          onClick={handleClickAudio}
        />

        {/* Share Camera */}
        {/* <ActionIcon
          iconPositive={TbVideo}
          iconNegative={TbVideoOff}
          onClick={handleClickVideo}
        /> */}

        {/* Leave Room */}
        <ActionIcon iconPositive={TbPhoneOff} mode="oneWay" />

        {/* Share Screen */}
        <ActionIcon
          iconPositive={TbScreenShare}
          iconNegative={TbScreenShareOff}
          onClick={handleShareScreen}
        />

        <ActionIcon iconPositive={TbMessages} iconNegative={TbMessagesOff} />

        <PopoverButton />
      </div>
    </div>
  );
};

export default ActionBar;
