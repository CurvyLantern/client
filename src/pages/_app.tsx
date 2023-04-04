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

  const userId = useBoundStore((s) => s.userId);
  const setUserId = useBoundStore((s) => s.setUserId);
  // initializing the socket;
  // TODO: find a better way to do this;
  const _socket = useSocketClient();

  useEffect(() => {
    if (userId) return;
    setUserId(`user_${nanoid(10)}`);
  }, [userId, setUserId]);

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
