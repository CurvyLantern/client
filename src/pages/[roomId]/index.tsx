import { ActionButtonParent } from "@/components/action/ActionButtonParent";
import { useChat } from "@/hooks/useChat";
import useScreenShare from "@/hooks/useScreenShare";
import { useMainStore } from "@/store/mainSlice";
import { useChatStore } from "@/store/slices/chatSlice";
import { MaybeStream } from "@/types";
import { getVideoStream } from "@/utils/StreamHelpers";
import {
  ActionIcon,
  AspectRatio,
  Button,
  Center,
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
  IconPlane,
  IconScreenShare,
  IconScreenShareOff,
} from "@tabler/icons-react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { FC, useEffect, useRef, useState } from "react";
import { useEffectOnce, useMeasure, useUnmount } from "react-use";
const room_notification_id = "room-notification";

const getShareAbleLinkByRoomId = (host: string, roomId: string) => {
  return `${host}/${roomId}`;
};
interface HostPageProps {
  roomId: string;
}

const MovieRoomPage = ({ roomId }: HostPageProps) => {
  const clipboard = useClipboard({ timeout: 1000 });
  const router = useRouter();

  const {
    isSharing,
    myScreenStream,
    foreignStreams,
    startSharing,
    stopSharing,
  } = useScreenShare({ roomId });

  const [isMuted, setIsMuted] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasStartedCalling, setHasStartedCalling] = useState(false);
  const [shareLink, setShareLink] = useState("");

  useEffectOnce(() => {
    setShareLink(getShareAbleLinkByRoomId(window.location.origin, roomId));
  });

  const socket = useMainStore((state) => state.socket);

  const callId = useRef("");
  const hostCallStream = useRef<MediaStream | null>(null);

  const handleChat = () => {
    // first toggle chat mode
    setIsChatOpen((prev) => !prev);

    //
  };

  useUnmount(() => {
    console.log("unmounting react use");
    hideNotification(room_notification_id);
    socket?.emit("logging-out", { roomId });
  });

  const chatMessages = useChatStore((state) => state.messages);
  const { sendMessage } = useChat(roomId);
  const [chatInput, setChatInput] = useState("");
  const [messageBoxRef, { height: messageBoxHeight }] =
    useMeasure<HTMLDivElement>();
  return (
    <>
      <div className="relative flex h-screen flex-col items-center  overflow-hidden  ">
        <div className="grid w-full grid-cols-1 gap-5 p-5 md:grid-cols-2 lg:grid-cols-3">
          {isSharing ? (
            <StreamWatcherComp stream={myScreenStream} host />
          ) : null}
          {foreignStreams.map((fStream, index) => {
            return <StreamWatcherComp stream={fStream} key={index} />;
          })}
        </div>

        {/* Action Bar */}
        <div className="absolute bottom-10 flex w-11/12 items-center justify-center space-x-10 rounded-md bg-black bg-opacity-40 py-4 px-3 text-white  backdrop-blur-xl md:w-1/2 ">
          {/* <p className="text-white">{track}</p> */}
          {/* Microphone */}
          {/* <ActionButtonParent>
            
            <ActionMic
              hostCallStream={hostCallStream}
              addCallStream={addCallStream}
            />
          </ActionButtonParent> */}
          {/* Monitor */}
          <ActionButtonParent>
            {isSharing ? (
              <Button
                onClick={() => {
                  stopSharing();
                }}
                className="flex items-center justify-center rounded-full bg-red-600 text-white"
              >
                <IconScreenShareOff aria-label="screen-share" />
              </Button>
            ) : (
              <Button
                onClick={() => {
                  startSharing();
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
          {/* <AspectRatio ratio={1} className="w-12">
            <Button
              onClick={() => {
                handleCancelCall();
              }}
              className="flex items-center justify-center rounded-full bg-neutral-800 text-red-500"
            >
              <IconPhoneOff />
            </Button>
          </AspectRatio> */}

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
        withCloseButton={true}
        position="right"
        opened={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        padding="xl"
        size="xl"
        styles={{
          drawer: {
            display: "flex",
            flexDirection: "column",
          },
          body: {
            flex: 1,
          },
        }}
      >
        {/* Drawer content */}
        <div className="chat_box flex h-full flex-col gap-5">
          <div className="flex-1" ref={messageBoxRef}>
            <ScrollArea
              style={{
                height: messageBoxHeight,
              }}
            >
              <div className="mt-auto flex h-full flex-col gap-4">
                {chatMessages.map((chat) => {
                  return (
                    <div key={chat.id}>
                      <div className="inline-flex max-w-[50%] flex-1  break-all rounded-r-xl bg-slate-600 px-3 py-2 ">
                        {chat.message}
                      </div>
                    </div>
                  );
                })}
              </div>
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
                sendMessage({
                  message: chatInput,
                  time: new Date().toISOString(),
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

interface StreamWatcherProps {
  stream: MaybeStream;
  host?: boolean;
}
const StreamWatcherComp: FC<StreamWatcherProps> = ({ stream, host }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [wantsToWatch, setWantsToWatch] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      if (host) {
        const videoStream = getVideoStream(stream);
        el.srcObject = videoStream;
      } else {
        el.srcObject = stream;
      }
    }
    return () => {
      if (el) {
        el.srcObject = null;
      }
    };
  }, [wantsToWatch, stream, host]);
  return (
    <AspectRatio ratio={16 / 9} className="w-full">
      <Skeleton></Skeleton>
      {wantsToWatch ? (
        <video
          playsInline
          autoPlay
          controls
          ref={ref}
          className="block h-full w-full object-contain"
        />
      ) : (
        <Center>
          <Button
            styles={(theme) => ({
              root: {
                borderRadius: theme.radius.lg,
                backgroundColor: theme.colors.gray,
              },
            })}
            onClick={() => {
              setWantsToWatch(true);
            }}
          >
            watch stream
          </Button>
        </Center>
      )}
    </AspectRatio>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  //  const proto =
  //    req.headers["x-forwarded-proto"] || req.connection.encrypted
  //      ? "https"
  //      : "http";
  // let proto = req.headers.referer;
  // console.log(proto, "test");
  const host = req.headers.host;
  const roomId = query.roomId;

  return {
    props: {
      roomId,
    },
  };
};

export default MovieRoomPage;
