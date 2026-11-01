import Head from 'next/head';
import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* Google Ads */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7151600814264166"
          crossOrigin="anonymous"
        />

        {/* Note font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Readex+Pro:wght@400;700&display=swap" />

        {/* Mobile search bar color */}
        <meta name="theme-color" content="black" />

        {/* Discord Embed */}
        <meta property="og:title" content="speedcubing.top" />
        <meta property="og:description" content="oh?" />
        <meta name="theme-color" content="#550000" />
        <meta property="og:url" content="https://speedcubing.top" />
        <meta property="og:image" content="https://speedcubing.top/favicon.ico" />

        {/* Viewport */}
        <meta name="viewport" content="width=1024" />

        {/* Icon */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />

      </Head>

      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}
