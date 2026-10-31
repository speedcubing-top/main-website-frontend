import matter from 'gray-matter';

export interface NoteNode {
  name: string;
  path: string;
  children: NoteNode[] | null;
}

export function encodeNotePath(file: string) {
  return file.split('/').map(encodeURIComponent).join('/');
}

export function getNoteApiPath(file: string) {
  return `/api/notes${encodeNotePath(file)}`;
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

export async function getNoteTreeServerSideProps(file: string) {
  const [result, treeRes] = await Promise.all([
    getNoteServerSideProps(file),
    fetch('http://main-website-backend:8080/api/notetree'),
  ]);

  if (!('props' in result)) {
    return result;
  }

  const tree: NoteNode[] = treeRes.ok ? await treeRes.json() : [];

  return {
    props: {
      ...result.props,
      tree,
    },
  };
}
