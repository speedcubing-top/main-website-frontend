import Head from 'next/head';
import type { AppProps } from 'next/app';
import { Inter, JetBrains_Mono, Readex_Pro } from 'next/font/google';
import Layout from '../components/Layout';
import PageSeo from '../components/PageSeo';
import '../styles/globals.css';

// Self-hosted and preloaded by next/font; _document keeps the page behind Loading until they arrive.
const inter = Inter({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600', '700'], variable: '--font-inter' });
const readexPro = Readex_Pro({ subsets: ['latin', 'latin-ext'], weight: ['400', '700'], variable: '--font-readex-pro' });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin', 'latin-ext'], weight: ['400', '700'], variable: '--font-jetbrains-mono' });
const fontVariables = `${inter.variable} ${readexPro.variable} ${jetBrainsMono.variable}`;

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

        {/* Mobile search bar color */}
        <meta name="theme-color" content="black" />

        {/* Discord Embed */}
        <meta key="og:site_name" property="og:site_name" content="speedcubing.top" />
        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:title" property="og:title" content="speedcubing.top" />
        <meta key="og:description" property="og:description" content="oh?" />
        <meta name="theme-color" content="#550000" />
        <meta key="og:url" property="og:url" content="https://speedcubing.top" />
        <meta key="og:image" property="og:image" content="https://speedcubing.top/favicon.ico" />

        {/* Viewport */}
        <meta name="viewport" content="width=1024" />

        {/* Icon */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />

      </Head>

      {pageProps.seo && <PageSeo {...pageProps.seo} />}

      <div className={fontVariables}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </div>
    </>
  );
}
