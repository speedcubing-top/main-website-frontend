
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader('Set-Cookie', 'token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax');
  res.writeHead(302, { Location: '/' });
  res.end();

  return { props: {} };
};

export default function Logout() {
  return null;
}