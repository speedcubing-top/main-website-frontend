import Head from 'next/head';
import Error404 from '../components/errorpage/Error404';

export default function NotFoundPage() {
  return (
    <>
      <Head>
        <title>404 Not Found</title>
      </Head>
      <Error404 />
    </>
  );
}
