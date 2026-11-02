import Head from 'next/head';
import React, { useEffect, useRef, useState } from 'react';
import Markdown, { ExtraProps, UrlTransform, defaultUrlTransform } from 'react-markdown';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

import 'highlight.js/styles/github-dark.css';
import 'github-markdown-css/github-markdown-dark.css';

import { getNoteApiPath, parseNote } from './NoteServerSideProps';
import remarkCallouts from './remarkCallouts';
import styles from './markdown.module.css';

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    div: [...(defaultSchema.attributes?.div ?? []), ['className', /^callout(-[a-z]+)?$/]],
  },
  protocols: {
    ...defaultSchema.protocols,
    src: [...(defaultSchema.protocols?.src ?? []), 'data'],
  },
};

const urlTransform: UrlTransform = (url, key, node) => {
  if (node.tagName === 'img' && key === 'src' && /^data:image\//i.test(url)) {
    return url;
  }
  return defaultUrlTransform(url);
};

export interface NoteHeading {
  id: string;
  text: string;
  level: number;
}

type CopyState = 'idle' | 'copied' | 'failed';

const COPY_LABELS: Record<CopyState, string> = { idle: 'Copy', copied: 'Copied', failed: 'Failed' };

const CodeBlock: React.FC<React.ComponentProps<'pre'> & ExtraProps> = ({ node, ref, ...props }) => {
  const preRef = useRef<HTMLPreElement>(null);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  useEffect(() => {
    if (copyState === 'idle') {
      return;
    }
    const timeoutId = setTimeout(() => setCopyState('idle'), 1500);
    return () => clearTimeout(timeoutId);
  }, [copyState]);

  const copy = async () => {
    try {
      // Markdown code ends with a newline that nobody wants in their terminal.
      await navigator.clipboard.writeText((preRef.current?.textContent ?? '').replace(/\n$/, ''));
      setCopyState('copied');
    } catch (err) {
      setCopyState('failed');
    }
  };

  return (
    <div className={styles.codeBlock}>
      <pre ref={preRef} {...props} />
      <button className={styles.copyButton} type="button" aria-label="Copy code" onClick={copy}>
        {COPY_LABELS[copyState]}
      </button>
    </div>
  );
};

// Images are shown smaller than the column, so clicking one opens it full size.
const NoteImage: React.FC<React.ComponentProps<'img'> & ExtraProps> = ({ node, ref, ...props }) => {
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!zoomed) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setZoomed(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [zoomed]);

  return (
    <>
      <img
        {...props}
        className={styles.image}
        onClick={(event) => {
          // A linked image should follow its link instead.
          if (!event.currentTarget.closest('a')) {
            setZoomed(true);
          }
        }}
      />
      {zoomed && (
        <span className={styles.lightbox} role="dialog" aria-label="Image" onClick={() => setZoomed(false)}>
          <img src={props.src} alt={props.alt} />
        </span>
      )}
    </>
  );
};

interface RenderMarkdownProps {
  content: string;
  file: string;
  title: string;
  birth?: string | null;
  modified?: string | null;
  showDates?: boolean;
  onHeadings?: (headings: NoteHeading[]) => void;
}

function formatModified(modified: string | null) {
  const date = modified ? new Date(modified) : null;
  if (!date || isNaN(date.getTime())) {
    return null;
  }

  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} `
    + `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export const RenderMarkdown: React.FC<RenderMarkdownProps> = ({ content, file, title, birth = null, modified = null, showDates = false, onHeadings }) => {
  const [markdown, setMarkdown] = useState<string>(content);
  const [markdownTitle, setMarkdownTitle] = useState<string>(title);
  const [markdownBirth, setMarkdownBirth] = useState<string | null>(birth);
  const [markdownModified, setMarkdownModified] = useState<string | null>(modified);
  const [mounted, setMounted] = useState<boolean>(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  // The server doesn't know the viewer's timezone, so Modify is formatted after hydration.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Read the headings back from the DOM so the ids always match what rehype-slug produced.
  useEffect(() => {
    const headings = Array.from(bodyRef.current?.querySelectorAll<HTMLElement>('h1[id], h2[id], h3[id]') ?? []);
    onHeadings?.(headings.map((heading) => ({
      id: heading.id,
      text: heading.textContent?.trim() ?? '',
      level: Number(heading.tagName[1]),
    })));
  }, [markdown, onHeadings]);

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        const res = await fetch(getNoteApiPath(file));
        if (!res.ok) {
          return;
        }

        const json = await res.json();
        const { content, title, birth } = parseNote(json.content, json.path ?? file);
        setMarkdownTitle(title);
        setMarkdownBirth(birth);
        setMarkdownModified(json.modified ?? null);
        setMarkdown(content);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };

    fetchMarkdown();
    const intervalId = setInterval(fetchMarkdown, 5000);
    return () => clearInterval(intervalId);
  }, [file, markdown]);

  return (
    <>
      <Head>
        <title>{markdownTitle}</title>
      </Head>
      <div ref={bodyRef} className={`markdown-body ${styles.wrapper}`}>
        {showDates && (
          <div className="mb-[24px] text-[14px] text-[#8b949e]">
            <div>Birth: {markdownBirth ?? 'Unknown'}</div>
            <div>Modify: {mounted && (formatModified(markdownModified) ?? 'Unknown')}</div>
          </div>
        )}
        <Markdown
          components={{
            pre: CodeBlock,
            img: NoteImage,
            // Links within the note stay in this tab, everything else opens a new one.
            a: ({ node, ...props }) => (
              props.href?.startsWith('#') ? <a {...props} /> : <a {...props} target="_blank" rel="noreferrer" />
            ),
          }}
          remarkPlugins={[remarkGfm, remarkCallouts, remarkBreaks]}
          rehypePlugins={[
            rehypeRaw,
            [rehypeSanitize, sanitizeSchema],
            rehypeHighlight,
            // After sanitize, which would prefix the ids with user-content-.
            rehypeSlug,
            [rehypeAutolinkHeadings, {
              behavior: 'prepend',
              properties: { className: ['heading-anchor'], ariaLabel: 'Link to this section' },
              content: [],
            }],
          ]}
          urlTransform={urlTransform}
        >
          {markdown}
        </Markdown>
      </div>
    </>
  );
};
