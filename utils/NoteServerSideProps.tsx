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

export function getNoteTitle(title: unknown, file: string) {
  if (title) {
    return String(title);
  }
  if (file === '' || file === '/mainpage') {
    return 'speedcubing.top Website';
  }
  return file.slice(file.lastIndexOf('/') + 1);
}

export function parseNote(raw: string, file: string) {
  try {
    const { data, content } = matter(raw, {});
    return { content, title: getNoteTitle(data?.title, file) };
  } catch (err) {
    return { content: raw, title: getNoteTitle(undefined, file) };
  }
}

export async function getNoteServerSideProps(file: string) {
  const res = await fetch(`http://main-website-backend:8080${getNoteApiPath(file)}`);

  if (!res.ok) {
    return { notFound: true };
  }

  const json = await res.json();

  const { content, title } = parseNote(json.content, file);

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
