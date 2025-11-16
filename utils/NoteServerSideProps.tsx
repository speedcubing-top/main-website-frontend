import matter from 'gray-matter';

export async function getNoteServerSideProps(file: string) {
  const res = await fetch('http://main-website-backend:8080/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file }),
  });

  const json = await res.json();

  if (!json.success) {
    return { notFound: true };
  }

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
