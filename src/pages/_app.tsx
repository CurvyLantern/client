import useNprogress from "@/hooks/useNprogress";
import { useSocketClient } from "@/hooks/useSocketClient";
import { useBoundStore } from "@/store";
import "@/styles/globals.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { nanoid } from "nanoid";
import { AppProps } from "next/app";
import Head from "next/head";

import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  useNprogress();
  useSocketClient();
  const userId = useBoundStore((s) => s.userId);
  const setUserId = useBoundStore((s) => s.setUserId);
  const socket = useBoundStore((s) => s.socket);

  useEffect(() => {
    if (userId) return;
    setUserId(`user_${nanoid(10)}`);
  }, [userId, setUserId]);

  useEffect(() => {
    if (userId && socket) {
      (socket.auth as { userId: string }).userId = userId;
      if (socket.connected) {
        socket.disconnect();
      } else {
        socket.connect();
      }
    }
  }, [userId, socket]);

  return (
    <>
      <Head>
        <title>Watch movies with friends</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: "dark",
        }}
      >
        <Notifications position="top-center" />
        <Component {...pageProps} />
      </MantineProvider>
    </>
  );
}
