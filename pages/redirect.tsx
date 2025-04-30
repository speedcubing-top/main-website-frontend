// /pages/redirect.tsx

import { GetServerSideProps } from 'next';
import Error400 from '../components/errorpage/Error400';

type Props = {
  link: string | null;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const link = context.query.url;
  if (typeof link !== 'string') {
    context.res.statusCode = 400;
    return { props: { link: null } };
  }

  return { props: { link } };
};

const Redirect = ({ link }: Props) => {
  if (!link) {
    return <Error400 />;
  }

  return (
    <div>
      Click to redirect to <a href={link}>{link}</a>
	</div>
  );
};

export default Redirect;
