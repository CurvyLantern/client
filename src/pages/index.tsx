import {
  createStyles,
  Container,
  Text,
  Button,
  Group,
  Modal,
  useMantineTheme,
  Flex,
  TextInput,
} from "@mantine/core";
import { app, database } from "libs/database/firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { createRoomId } from "@/utils/Helpers";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { showNotification, updateNotification } from "@mantine/notifications";
import { useRoomCreateNotification } from "@/utils/Notifications";
import { createRoom } from "@/utils/RoomHelpers";

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
  const [roomCode, setRoomCode] = useState("");
  const notification = useRoomCreateNotification();

  const onJoinRoom = (roomId: string) => {
    router.push(`/${roomId}`);
  };
  const onCreateRoom = async () => {
    notification.start();
    const { roomId } = (await fetch("/api/v1/createRoomId").then((res) =>
      res.json()
    )) as { roomId: string };
    console.log({ roomId }, "testing");
    notification.update();
    onJoinRoom(roomId);
  };

  const theme = useMantineTheme();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [constraints, setConstraints] = useState<[string, any][]>([]);
  useEffect(() => {
    let cs = window.navigator.mediaDevices.getSupportedConstraints();
    const arr = Object.entries(cs);
    setConstraints(arr);
  }, []);
  return (
    <div className={classes.wrapper}>
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
            value={roomCode}
            onChange={(evt) => setRoomCode(evt.currentTarget.value)}
          />
          <Button
            variant="outline"
            color={"yellow"}
            onClick={() => onJoinRoom(roomCode)}
          >
            Proceed
          </Button>
        </Flex>
      </Modal>
    </div>
  );
};

// export const getServerSideProps: GetServerSideProps = async ({ req }) => {
//   const forwarded = req.headers["x-forwarded-for"];
//   const ip = forwarded
//     ? (forwarded as string).split(/, /)[0]
//     : req.socket.remoteAddress;

//   console.log({ ip });

//   return {
//     props: {},
//   };
// };

export default IndexPage;
