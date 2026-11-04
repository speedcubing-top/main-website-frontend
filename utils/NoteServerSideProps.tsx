import matter from 'gray-matter';

export interface NoteNode {
  name: string;
  path: string;
  slug: string | null;
  date: string | null;
  children: NoteNode[] | null;
}

export interface PageSeo {
  title?: string;
  type?: 'website' | 'article';
  publishedTime?: string | null;
  canonical?: string;
  description?: string | null;
  jsonLd?: object | null;
  noindex?: boolean;
}

export const NOTE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?$/;

const SITE_URL = 'https://speedcubing.top';
const NOTE_LIST_DESCRIPTION = 'Notes from speedcubing.top, newest first.';
const DESCRIPTION_LENGTH = 155;
const SERVER_FETCH_TIMEOUT_MS = 2000;

// Bound both headers and body reading so a slow backend cannot hold the page open.
async function fetchServerJson(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SERVER_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return { ok: res.ok, status: res.status, json: res.ok ? await res.json() : null };
  } finally {
    clearTimeout(timeout);
  }
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

function getContentSummary(content: string) {
  const text = content
    .replace(/(```|~~~)[\s\S]*?\1/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\[![a-z]+\]/gi, ' ')
    .replace(/^[\s|:-]+$/gm, ' ')
    .replace(/^(\s*(#{1,6}|>|[-*+]|\d+\.)\s+)+/gm, ' ')
    .replace(/[`*~|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const chars = Array.from(text);
  return chars.length > DESCRIPTION_LENGTH ? `${chars.slice(0, DESCRIPTION_LENGTH).join('').trimEnd()}…` : text;
}

function getNoteDescription(description: unknown, content: string) {
  return (description ? String(description).trim() : getContentSummary(content)) || null;
}

function getNoteUrl(path: string, slug?: string | null) {
  if (path === '/mainpage') {
    return `${SITE_URL}/`;
  }
  return `${SITE_URL}/notes${slug ? `/${slug}` : encodeNotePath(path)}`;
}

function getNotePublishedTime(birth: string | null) {
  return birth && NOTE_DATE_PATTERN.test(birth) ? birth.replace(' ', 'T') : null;
}

function getNoteJsonLd(url: string, title: string, description: string | null, publishedTime: string | null) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description ?? undefined,
    // Modify comes from the file's mtime, which a clone resets, so dateModified is left out.
    datePublished: publishedTime ?? undefined,
    url,
    mainEntityOfPage: url,
    author: { '@type': 'Person', name: 'speedcubing', url: SITE_URL },
  };
}

export function parseNote(raw: string, file: string) {
  try {
    const { data, content, matter: frontMatter } = matter(raw, {}) as ReturnType<typeof matter> & { matter: string };
    return {
      content,
      title: getNoteTitle(data?.title, file),
      birth: getNoteBirth(frontMatter),
      description: getNoteDescription(data?.description, content),
    };
  } catch (err) {
    return { content: raw, title: getNoteTitle(undefined, file), birth: null, description: getNoteDescription(undefined, raw) };
  }
}

async function getNoteTree(): Promise<NoteNode[]> {
  try {
    const res = await fetchServerJson('http://main-website-backend:8080/api/notetree');
    return res.ok ? res.json : [];
  } catch {
    return [];
  }
}

export async function getNoteListServerSideProps() {
  return {
    props: {
      file: '',
      tree: await getNoteTree(),
      seo: { title: 'Notes', canonical: `${SITE_URL}/notes`, description: NOTE_LIST_DESCRIPTION },
    },
  };
}

export async function getNoteServerSideProps(file: string) {
  let res: Awaited<ReturnType<typeof fetchServerJson>>;
  try {
    res = await fetchServerJson(`http://main-website-backend:8080${getNoteApiPath(file)}`);
    if (!res.ok && res.status !== 404) {
      throw new Error(`Note backend returned ${res.status}`);
    }
  } catch {
    // Return a small page; the browser can keep waiting for the note independently.
    const title = getNoteTitle(undefined, file);
    return {
      props: {
        content: '', file, path: file, title,
        seo: { title, canonical: getNoteUrl(file) },
      },
    };
  }

  if (!res.ok) {
    return { notFound: true };
  }

  const json = res.json;

  if (json.slug && file !== `/${json.slug}`) {
    return { redirect: { destination: `/notes/${json.slug}`, statusCode: 301 } };
  }

  const path: string = json.path ?? file;
  const { title, birth, description } = parseNote(json.content, path);
  const canonical = getNoteUrl(path, json.slug);
  const isNote = path !== '/mainpage';
  const publishedTime = getNotePublishedTime(birth);

  return {
    props: {
      // Every document uses the same progressive browser loading flow.
      content: '',
	  file,
	  path,
	  title,
	  birth,
	  modified: json.modified ?? null,
	  seo: {
	    title,
	    type: isNote ? 'article' : 'website',
	    publishedTime: isNote ? publishedTime : null,
	    canonical,
	    description,
	    jsonLd: isNote ? getNoteJsonLd(canonical, title, description, publishedTime) : null,
	  },
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
