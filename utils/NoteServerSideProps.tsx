import matter from 'gray-matter';

export interface NoteNode {
  name: string;
  path: string;
  slug: string | null;
  date: string | null;
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

// YAML turns dates into UTC Date objects, so read the value as it was written.
function getNoteBirth(frontMatter: string) {
  const match = frontMatter.match(/^date:[ \t]*["']?(.*?)["']?[ \t]*$/m);
  return match?.[1] || null;
}

export function parseNote(raw: string, file: string) {
  try {
    const { data, content, matter: frontMatter } = matter(raw, {}) as ReturnType<typeof matter> & { matter: string };
    return { content, title: getNoteTitle(data?.title, file), birth: getNoteBirth(frontMatter) };
  } catch (err) {
    return { content: raw, title: getNoteTitle(undefined, file), birth: null };
  }
}

async function getNoteTree(): Promise<NoteNode[]> {
  const res = await fetch('http://main-website-backend:8080/api/notetree');
  return res.ok ? res.json() : [];
}

export async function getNoteListServerSideProps() {
  return {
    props: {
      file: '',
      tree: await getNoteTree(),
    },
  };
}

export async function getNoteServerSideProps(file: string) {
  const res = await fetch(`http://main-website-backend:8080${getNoteApiPath(file)}`);

  if (!res.ok) {
    return { notFound: true };
  }

  const json = await res.json();

  if (json.slug && file !== `/${json.slug}`) {
    return { redirect: { destination: `/notes/${json.slug}`, statusCode: 301 } };
  }

  const path: string = json.path ?? file;
  const { content, title, birth } = parseNote(json.content, path);

  return {
    props: {
      content,
	  file,
	  path,
	  title,
	  birth,
	  modified: json.modified ?? null,
    },
  };
}

export async function getNoteTreeServerSideProps(file: string) {
  const [result, tree] = await Promise.all([
    getNoteServerSideProps(file),
    getNoteTree(),
  ]);

  if (!('props' in result)) {
    return result;
  }

  return {
    props: {
      ...result.props,
      tree,
    },
  };
}
