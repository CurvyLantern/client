import { useBoundStore } from "@/store";
import { useRoomCheckerToast, useRoomCreateToast } from "@/utils/Notifications";
import { Modal, TextInput, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/router";
import { useState } from "react";

const IndexPage = () => {
  const router = useRouter();
  const userId = useBoundStore((s) => s.userId);
  const roomCreateToast = useRoomCreateToast();
  const roomCheckerToast = useRoomCheckerToast();
  const [isModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [joinRoomId, setJoinRoomId] = useState("");

  const enterWaitlist = (roomId: string) => {
    const searchStr = new URLSearchParams({
      roomId,
    }).toString();
    router.push({
      pathname: "waitlist",
      search: searchStr,
    });
  };

  const onJoinRoom = async (roomId: string) => {
    roomCheckerToast.start();
    const { roomState } = await fetch(`api/v1/checkRoom/${roomId}`).then<{
      roomState: "available" | "unavailable";
    }>((res) => res.json());
    if (roomState === "available") {
      roomCheckerToast.success();
      enterWaitlist(roomId);
    } else {
      roomCheckerToast.failure();
      setJoinRoomId("");
    }
  };

  // create room function
  const onCreateRoom = async () => {
    roomCreateToast.start();
    try {
      const { roomId } = await fetch(`/api/v1/getNewRoom/${userId}`).then<{
        roomId: string;
      }>((res) => res.json());
      console.log({ roomId }, "testing");
      router.push(`/${roomId}`);
    } catch (error) {
      console.error(error);
    }
    roomCreateToast.update();
  };

  const theme = useMantineTheme();
  return (
    <div className="relative flex h-full items-center justify-center bg-neutral-900">
      <div className="relative mx-auto w-11/12 max-w-3xl">
        <h1 className="m-0 p-0 text-4xl font-extrabold leading-none md:text-6xl">
          It&apos;s{" "}
          <span
            className="bg-gradient-to-r
           from-pink-500 to-white bg-clip-text
            text-transparent
            "
          >
            Muvitime
          </span>{" "}
        </h1>
        <p className="m-0 mt-3 p-0 text-3xl font-bold">
          watch movies with friends
        </p>

        <p className="mt-7 text-xl text-neutral-400 md:text-2xl">
          you don&apos;t have to create an account or pay anything. It&apos;s
          completely free. Just create a room or join one.
        </p>

        <div className="mt-14 flex flex-col gap-5 xsm:flex-row">
          <button
            className="rounded-md bg-gradient-to-r from-pink-500 
            to-purple-800 px-9 py-5  outline-transparent"
            type="button"
            onClick={() => {
              onCreateRoom();
            }}
          >
            Create Room
          </button>

          <button
            className="rounded-md border-2 border-yellow-500 bg-transparent px-9 py-5 
             text-yellow-500 outline-transparent"
            type="button"
            onClick={openModal}
          >
            {/* Create Room {Math.random()} */}
            Join Room
          </button>
        </div>
      </div>
      <Modal
        styles={() => ({
          inner: {
            padding: 0,
            overflow: "hidden",
          },
        })}
        trapFocus
        centered
        opened={isModalOpen}
        onClose={closeModal}
        overlayProps={{
          color:
            theme.colorScheme === "dark"
              ? theme.colors.dark[9]
              : theme.colors.gray[2],
          opacity: 0.77,
          blur: 3,
        }}
      >
        <div className="flex flex-col gap-7">
          <TextInput
            styles={(theme) => ({
              input: {
                textAlign: "center",
              },
            })}
            size="xl"
            placeholder="Enter room code"
            value={joinRoomId}
            onChange={(evt) => setJoinRoomId(evt.currentTarget.value)}
          />
          <button
            className="rounded-md border-2 border-yellow-500 bg-transparent px-9 py-2 text-sm font-bold 
             text-yellow-500 outline-transparent"
            type="button"
            onClick={() => onJoinRoom(joinRoomId)}
          >
            {/* Create Room {Math.random()} */}
            Proceed
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default IndexPage;
