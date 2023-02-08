import { GuestVideo } from "@/components/CustomVideo";
import { ActionButtonParent } from "@/components/action/ActionButtonParent";
import { ActionMic } from "@/components/action/ActionMic";
import { CommonUserMedia } from "@/components/video/CommonVideo";
import { usePeer } from "@/hooks/usePeer";
import { useChatStore } from "@/store/ChatStore";
import { usePeerStore } from "@/store/PeerStore";
import { audioConstraints, videoConstraints } from "@/utils/Constraints";
import { stopStream } from "@/utils/Helpers";
import { getStream } from "@/utils/StreamHelpers";
import {
  ActionIcon,
  AspectRatio,
  Button,
  Drawer,
  Popover,
  ScrollArea,
  Skeleton,
  TextInput,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { hideNotification } from "@mantine/notifications";
import {
  IconDotsVertical,
  IconMessage,
  IconMicrophone,
  IconMicrophoneOff,
  IconPhoneOff,
  IconPlane,
  IconScreenShare,
  IconScreenShareOff,
} from "@tabler/icons-react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useMemo, useRef, useState } from "react";
import { useUnmount, useMeasure } from "react-use";
const room_notification_id = "room-notification";

const getShareAbleLinkByRoomId = (host: string, roomId: string) => {
  return `${host}/${roomId}`;
};
interface HostPageProps {
  shareLink: string;
  roomId: string;
}
const getVideoStream = (stream?: MediaStream) => {
  if (!stream) throw new Error("no stream provided");
  const videoTrack = stream.getVideoTracks();
  return new MediaStream(videoTrack!);
};
const MovieRoomPage = ({ shareLink, roomId }: HostPageProps) => {
  const clipboard = useClipboard({ timeout: 1000 });
  const router = useRouter();

  const {
    clearEveryThing,
    addCallStream,
    addScreenStream,
    removeStream: removePeerStream,
  } = usePeer(roomId);

  const [isSharing, setIsSharing] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasStartedCalling, setHasStartedCalling] = useState(false);

  const socket = usePeerStore((state) => state.socket);
  const peerData = usePeerStore((state) => state.peerData);

  const hostScreenStream = useRef<MediaStream | null>(null);
  const hostVideoRef = useRef<HTMLVideoElement>(null);
  const callId = useRef("");
  const hostCallStream = useRef<MediaStream | null>(null);

  const friendsVideoEl = useMemo(() => {
    return Array.from(peerData);
  }, [peerData]);

  const startScreenShare = async () => {
    setIsSharing(true);

    const stream = await getStream(
      { video: videoConstraints, audio: audioConstraints },
      stopScreenShare
    );
    if (stream) {
      // for cancelling later
      hostScreenStream.current = stream;

      //BUG :do this pure simple peer way
      addScreenStream(stream);

      if (hostVideoRef.current) {
        try {
          hostVideoRef.current.srcObject = getVideoStream(stream);
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  const stopScreenShare = () => {
    console.log("call ended");
    setIsSharing(false);
    if (hostVideoRef.current) {
      hostVideoRef.current.srcObject = null;
    }
    //remove stream from peer
    removePeerStream(hostScreenStream.current);

    //remove tracks
    stopStream(hostScreenStream.current);
  };

  const handleChat = () => {
    // first toggle chat mode
    setIsChatOpen((prev) => !prev);

    //
  };

  const startCall = async () => {
    if (hasStartedCalling) return false;
    setHasStartedCalling(true);
    try {
      const callStream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
        video: false,
      });

      callId.current = callStream.id;
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
    setIsMuted(true);
    muteAudio(true);
  };

  const handleUnMute = () => {
    console.log("un muting");
    setIsMuted(false);

    if (!hasStartedCalling) {
      startCall();
    } else {
      muteAudio(true);
    }
  };

  const handleCancelCall = () => {
    stopStream(hostCallStream.current);
    clearEveryThing(() => {
      router.push("/");
    });
  };

  useUnmount(() => {
    console.log("unmounting react use");
    hideNotification(room_notification_id);
    socket?.emit("logging-out", { roomId });
  });

  const chatMessages = useChatStore((state) => state.messages);
  const enterChat = useChatStore((state) => state.enterChat);
  const [chatInput, setChatInput] = useState("");
  const messageBoxRef = useRef<HTMLDivElement>(null);
  const {} = useMeasure();
  return (
    <>
      <div className="relative flex h-screen flex-col items-center  overflow-hidden  ">
        {/* Drawer */}

        <div className="grid w-full grid-cols-3 gap-5 p-5">
          <CommonUserMedia ref={hostVideoRef} />
          {friendsVideoEl.map(([userId]) => {
            return <GuestVideo userId={userId} key={userId} />;
          })}
        </div>

        {/* Action Bar */}
        <div className="absolute bottom-10 flex w-11/12 items-center justify-center space-x-10 rounded-md bg-black bg-opacity-40 py-4 px-3 text-white  backdrop-blur-xl md:w-1/2 ">
          {/* <p className="text-white">{track}</p> */}
          {/* Microphone */}
          <ActionButtonParent>
            <ActionMic
              hostCallStream={hostCallStream}
              addCallStream={addCallStream}
            />
          </ActionButtonParent>
          {/* Monitor */}
          <ActionButtonParent>
            {isSharing ? (
              <Button
                onClick={() => {
                  stopScreenShare();
                }}
                className="flex items-center justify-center rounded-full bg-red-600 text-white"
              >
                <IconScreenShareOff aria-label="screen-share" />
              </Button>
            ) : (
              <Button
                onClick={() => {
                  startScreenShare();
                }}
                className="flex items-center justify-center rounded-full bg-neutral-800"
              >
                <IconScreenShare aria-label="screen-share" />
              </Button>
            )}
          </ActionButtonParent>
          {/* Chat Box */}
          <AspectRatio ratio={1} className="w-12">
            <Button
              onClick={() => {
                handleChat();
              }}
              className="flex items-center justify-center rounded-full bg-neutral-800 text-blue-500"
            >
              <IconMessage />
            </Button>
          </AspectRatio>
          {/* Call End */}
          <AspectRatio ratio={1} className="w-12">
            <Button
              onClick={() => {
                handleCancelCall();
              }}
              className="flex items-center justify-center rounded-full bg-neutral-800 text-red-500"
            >
              <IconPhoneOff />
            </Button>
          </AspectRatio>

          <div>
            <Popover
              middlewares={{ flip: true, shift: true, inline: true }}
              trapFocus
              position="top"
              withArrow
              shadow="md"
            >
              <Popover.Target>
                {/* <Button>Toggle popover</Button> */}
                <Button variant="subtle" p={0} className="">
                  <IconDotsVertical />
                </Button>
              </Popover.Target>
              <Popover.Dropdown
                sx={(theme) => ({
                  background:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[7]
                      : theme.white,
                })}
              >
                <p>{shareLink}</p>
                <Button
                  fullWidth
                  compact
                  color={clipboard.copied ? "green" : "blue"}
                  onClick={() => {
                    clipboard.copy(shareLink);
                  }}
                >
                  {clipboard.copied ? "copied" : "copy"}
                </Button>
              </Popover.Dropdown>
            </Popover>
          </div>
        </div>
      </div>
      <Drawer
        overlayOpacity={0.55}
        overlayBlur={3}
        withCloseButton={false}
        position="right"
        opened={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        padding="xl"
        size="xl"
        styles={{
          drawer: {
            display: "flex",
          },
          body: {
            flex: 1,
          },
        }}
      >
        {/* Drawer content */}
        <div className="chat_box flex h-full flex-col gap-5">
          <div className="flex-1 bg-red-400" ref={messageBoxRef}>
            <ScrollArea
              style={{
                height: "100%",
              }}
            >
              {chatMessages.map((chat) => {
                return (
                  <div key={chat.id}>
                    <div className="inline-flex max-w-[50%] flex-1  break-all rounded-r-xl bg-slate-600 px-3 py-2 ">
                      {chat.message}
                    </div>
                  </div>
                );
              })}
            </ScrollArea>
          </div>

          <div className="flex gap-5">
            <TextInput
              value={chatInput}
              onChange={(evt) => setChatInput(evt.currentTarget.value)}
              placeholder="let's watch sholay :D"
              radius="xl"
              size="md"
              styles={{
                root: {
                  flex: 1,
                },
              }}
            />
            <ActionIcon
              onClick={() => {
                enterChat({
                  message: chatInput,
                  time: Date(),
                  username: "nasim",
                });
                setChatInput("");
              }}
              color="indigo"
              size="xl"
              radius="xl"
              variant="filled"
            >
              <IconPlane />
            </ActionIcon>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const host = req.headers.host;
  const roomId = query.roomId;

  const shareLink = getShareAbleLinkByRoomId(host!, roomId as string);
  return {
    props: {
      shareLink,
      roomId,
    },
  };
};

export default MovieRoomPage;
