import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import Markdown, { UrlTransform, defaultUrlTransform } from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
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

interface RenderMarkdownProps {
  content: string;
  file: string;
  title: string;
  birth?: string | null;
  modified?: string | null;
  showDates?: boolean;
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

export const RenderMarkdown: React.FC<RenderMarkdownProps> = ({ content, file, title, birth = null, modified = null, showDates = false }) => {
  const [markdown, setMarkdown] = useState<string>(content);
  const [markdownTitle, setMarkdownTitle] = useState<string>(title);
  const [markdownBirth, setMarkdownBirth] = useState<string | null>(birth);
  const [markdownModified, setMarkdownModified] = useState<string | null>(modified);
  const [mounted, setMounted] = useState<boolean>(false);

  // The server doesn't know the viewer's timezone, so Modify is formatted after hydration.
  useEffect(() => {
    setMounted(true);
  }, []);

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
      <div className={`markdown-body ${styles.wrapper}`}>
        {showDates && (
          <div className="mb-[24px] text-[14px] text-[#8b949e]">
            <div>Birth: {markdownBirth ?? 'Unknown'}</div>
            <div>Modify: {mounted && (formatModified(markdownModified) ?? 'Unknown')}</div>
          </div>
        )}
        <Markdown
          components={{
            a: ({ href, children }) => (
              <a href={href as string} target="_blank" rel="noreferrer">
                {children}
              </a>
            ),
          }}
          remarkPlugins={[remarkGfm, remarkCallouts, remarkBreaks]}
          rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema], rehypeHighlight]}
          urlTransform={urlTransform}
        >
          {markdown}
        </Markdown>
      </div>
    </>
  );
};
