import { useBoundStore } from "@/store";
import "@/styles/globals.css";
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect } from "react";

export default function App(props: AppProps) {
  const { Component, pageProps } = props;
  const router = useRouter();
  const a = useBoundStore((state) => state);

  useEffect(() => {
    NProgress.configure({ showSpinner: false });
  }, []);

  useEffect(() => {
    const handleStart = (url: string) => {
      console.log(`Loading: ${url}`);
      NProgress.start();
    };

    const handleStop = () => {
      NProgress.done();
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleStop);
    router.events.on("routeChangeError", handleStop);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleStop);
      router.events.off("routeChangeError", handleStop);
    };
  }, [router]);

  return (
    <>
      <Head>
        <title>Watch movies with friends</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      {/* <UserDataProvider>
        <SocketProvider> */}
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: "dark",
        }}
      >
        <NotificationsProvider position="top-center" zIndex={99999}>
          <div>
            {/* {process.env.NODE_ENV === "development" ? <DebugPanel /> : null} */}
            <Component {...pageProps} />
          </div>
        </NotificationsProvider>
      </MantineProvider>
      {/* </SocketProvider>
      </UserDataProvider> */}
    </>
  );
}
