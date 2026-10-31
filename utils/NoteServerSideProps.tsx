import matter from 'gray-matter';

export function getNoteApiPath(file: string) {
  return `/api/notes${file.split('/').map(encodeURIComponent).join('/')}`;
}

export async function getNoteServerSideProps(file: string) {
  const res = await fetch(`http://main-website-backend:8080${getNoteApiPath(file)}`);

  if (!res.ok) {
    return { notFound: true };
  }

  const json = await res.json();

  const { data, content } = matter(json.content);

  let title = data?.title || 'speedcubing.top Website';

  return {
    props: {
      content,
	  file,
	  title,
    },
  };
}
