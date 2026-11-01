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
import styles from './markdown.module.css';

const sanitizeSchema = {
  ...defaultSchema,
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
}

export const RenderMarkdown: React.FC<RenderMarkdownProps> = ({ content, file, title }) => {
  const [markdown, setMarkdown] = useState<string>(content);
  const [markdownTitle, setMarkdownTitle] = useState<string>(title);

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        const res = await fetch(getNoteApiPath(file));
        if (!res.ok) {
          return;
        }

        const json = await res.json();
        if (json.content !== markdown) {
          const { content, title } = parseNote(json.content, file);
          setMarkdownTitle(title);
          setMarkdown(content);
        }
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
        <Markdown
          components={{
            a: ({ href, children }) => (
              <a href={href as string} target="_blank" rel="noreferrer">
                {children}
              </a>
            ),
          }}
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema], rehypeHighlight]}
          urlTransform={urlTransform}
        >
          {markdown}
        </Markdown>
      </div>
    </>
  );
};
