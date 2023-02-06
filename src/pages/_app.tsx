import '@/styles/globals.css'
import { AppProps } from 'next/app';
import Head from 'next/head';
import { MantineProvider } from '@mantine/core';
import { SocketProvider } from "@/contexts/SocketContext";
import { NotificationsProvider } from "@mantine/notifications";
import { useRouter } from "next/router";
import { useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { Demo } from "@/components/ShowUserId";
import { UserDataProvider } from "@/contexts/UserDataContext";

export default function App(props: AppProps) {
  const { Component, pageProps } = props;
  const router = useRouter();
  NProgress.configure({ showSpinner: false });

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
                <Demo />
                <Component {...pageProps} />
              </div>
            </NotificationsProvider>
          </MantineProvider>
        {/* </SocketProvider>
      </UserDataProvider> */}
    </>
  );
}
