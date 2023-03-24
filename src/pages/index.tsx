import { useBoundStore } from "@/store";
import { useRoomCheckerToast, useRoomCreateToast } from "@/utils/Notifications";
import {
  Button,
  Container,
  createStyles,
  Flex,
  Group,
  Modal,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const BREAKPOINT = "@media (max-width: 755px)";

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: "relative",
    height: "100vh",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
  },

  inner: {
    position: "relative",
    paddingTop: 200,
    paddingBottom: 120,

    [BREAKPOINT]: {
      paddingBottom: 80,
      paddingTop: 80,
    },
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontSize: 62,
    fontWeight: 900,
    lineHeight: 1.1,
    margin: 0,
    padding: 0,
    color: theme.colorScheme === "dark" ? theme.white : theme.black,

    [BREAKPOINT]: {
      fontSize: 42,
      lineHeight: 1.2,
    },
  },

  description: {
    marginTop: theme.spacing.xl,
    fontSize: 24,

    [BREAKPOINT]: {
      fontSize: 18,
    },
  },

  controls: {
    marginTop: theme.spacing.xl * 2,

    [BREAKPOINT]: {
      marginTop: theme.spacing.xl,
    },
  },

  control: {
    height: 54,
    paddingLeft: 38,
    paddingRight: 38,

    [BREAKPOINT]: {
      height: 54,
      paddingLeft: 18,
      paddingRight: 18,
      flex: 1,
    },
  },
}));

const IndexPage = () => {
  const { classes } = useStyles();
  const router = useRouter();
  const userId = useBoundStore((s) => s.userId);
  const roomCreateToast = useRoomCreateToast();
  const roomCheckerToast = useRoomCheckerToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState("");

  const enterWaitlist = (roomId: string) => {
    router.push(`/waitlist/${roomId}`);
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
  const onCreateRoom = async () => {
    roomCreateToast.start();
    const { roomId } = (await fetch(`/api/v1/getNewRoom/${userId}`).then(
      (res) => res.json()
    )) as { roomId: string };
    console.log({ roomId }, "testing");
    roomCreateToast.update();
    router.push(`/${roomId}`);
  };

  const theme = useMantineTheme();

  const [constraints, setConstraints] = useState<[string, any][]>([]);
  useEffect(() => {
    let cs = window.navigator.mediaDevices.getSupportedConstraints();
    const arr = Object.entries(cs);
    setConstraints(arr);
  }, []);
  return (
    <div className={classes.wrapper}>
      <Container size={700} className={classes.inner}>
        <h1 className={classes.title}>
          It&apos;s{" "}
          <Text
            component="span"
            variant="gradient"
            gradient={{ from: "pink", to: "white" }}
            inherit
          >
            Muvitime
          </Text>{" "}
          <Text component="p" inherit my={"sm"} size={"md"}>
            watch movies with friends
          </Text>
        </h1>

        <Text className={classes.description} color="dimmed">
          you don&apos;t have to create an account or pay anything. It&apos;s
          completely free. Just create a room or join one.
        </Text>

        <Group className={classes.controls}>
          <Button
            size="xl"
            className={classes.control}
            variant="gradient"
            gradient={{ from: "pink", to: "purple" }}
            onClick={() => {
              onCreateRoom();
            }}
          >
            {/* Create Room {Math.random()} */}
            Create Room
          </Button>

          <Button
            size="xl"
            variant="outline"
            color={"yellow"}
            className={classes.control}
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            Join Room
          </Button>
        </Group>
      </Container>
      <Modal
        trapFocus
        centered
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        overlayOpacity={0.7}
        overlayBlur={3}
        overlayColor={
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[2]
        }
      >
        <Flex direction={"column"} rowGap={30}>
          <TextInput
            styles={(theme) => ({
              input: {
                textAlign: "center",
              },
            })}
            size="xl"
            placeholder="Enter room code"
            className="text-center"
            value={joinRoomId}
            onChange={(evt) => setJoinRoomId(evt.currentTarget.value)}
          />
          <Button
            variant="outline"
            color={"yellow"}
            onClick={() => onJoinRoom(joinRoomId)}
          >
            Proceed
          </Button>
        </Flex>
      </Modal>
    </div>
  );
};

export default IndexPage;

/* 

<div
        className="
      fixed
      top-0 right-0 z-[2000] w-52 bg-black p-4 text-white opacity-70 shadow-sm"
      >
        <table>
          {constraints.map((obj, idx) => {
            return (
              <tr key={idx}>
                {obj[0]} : {JSON.stringify(obj[1])}
              </tr>
            );
          })}
        </table>
      </div>
*/
