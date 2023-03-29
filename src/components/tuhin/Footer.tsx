import {
  HiMicrophone,
  HiVideoCamera,
  HiVideoCameraSlash,
} from "react-icons/hi2";
import {
  BsFillMicMuteFill,
  BsThreeDotsVertical,
  BsDisplay,
  BsFillChatLeftTextFill,
} from "react-icons/bs";
import { MdOutlinePhoneMissed } from "react-icons/md";
import { FaWindowClose } from "react-icons/fa";
import { useState } from "react";

const Footer = () => {
  const [clickedAudio, setclickedAudio] = useState(false);
  const [clickedVideo, setclickedVideo] = useState(false);
  const [shareScreen, setShareScreen] = useState(false);

  const handleClickAudio = () => {
    setclickedAudio(!clickedAudio);
  };

  const handleClickVideo = () => {
    setclickedVideo(!clickedVideo);
  };
  const handleShareScreen = () => {
    setShareScreen(!shareScreen);
  };
  return (
    <div>
      <div className="flex items-center justify-evenly">
        <div className="flex gap-2">
          <div className="rounded-full bg-gray-200 px-3 py-2">
            {
              // <HiMicrophone
              clickedAudio ? (
                <>
                  <HiMicrophone
                    onClick={handleClickAudio}
                    className="text-gray-500"
                  />
                </>
              ) : (
                <>
                  <BsFillMicMuteFill
                    onClick={handleClickAudio}
                    className="text-gray-500"
                  />
                </>
              )
            }
          </div>
          <div className="rounded-full bg-gray-200 px-3 py-2">
            {
              // <HiVideoCamera
              clickedVideo ? (
                <>
                  <HiVideoCamera
                    onClick={handleClickVideo}
                    className="text-gray-500"
                  />
                </>
              ) : (
                <>
                  <HiVideoCameraSlash
                    onClick={handleClickVideo}
                    className="text-gray-500"
                  />
                </>
              )
            }
          </div>

          <div className="rounded-full bg-red-500 px-3 py-2">
            <MdOutlinePhoneMissed className="text-white" />
          </div>

          <div className="rounded-full bg-gray-200 px-3 py-2">
            {shareScreen ? (
              <>
                <FaWindowClose
                  onClick={handleShareScreen}
                  className="text-gray-500"
                />
              </>
            ) : (
              <>
                <BsDisplay
                  onClick={handleShareScreen}
                  className="text-gray-500"
                />
              </>
            )}
          </div>

          <div className="rounded-full bg-gray-200 px-3 py-2">
            <BsThreeDotsVertical className="text-gray-500" />
          </div>
          <div className=" ml-6 rounded-full bg-gray-200 px-3 py-2">
            <BsFillChatLeftTextFill className="text-gray-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
