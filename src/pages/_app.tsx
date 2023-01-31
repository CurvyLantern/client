import '@/styles/globals.css'
import { AppProps } from 'next/app';
import Head from 'next/head';
import { MantineProvider } from '@mantine/core';
// import { StreamProvider } from '@/contexts/StreamContext';
// import { SocketProvider } from '@/contexts/SocketContext';
export default function App(props: AppProps) {
	const { Component, pageProps } = props;

	return (
		<>
			<Head>
				<title>Watch movies with friends</title>
				<meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width' />
			</Head>
			<MantineProvider
				withGlobalStyles
				withNormalizeCSS
				theme={{
					/** Put your mantine theme override here */
					colorScheme: 'dark',
				}}>
				<Component {...pageProps} />
			</MantineProvider>
		</>
	);
}
