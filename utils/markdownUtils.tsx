import React, { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

import 'highlight.js/styles/github-dark.css';
import 'github-markdown-css/github-markdown-dark.css';

import styles from './markdown.module.css';

interface RenderMarkdownProps {
  content: string;
  file: string;
}

export const RenderMarkdown: React.FC<RenderMarkdownProps> = ({ content, file }) => {
  const [markdown, setMarkdown] = useState<string>(content);

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        const res = await fetch('https://speedcubing.top/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file }),
        });

        const json = await res.json();
        if (json.success && json.content !== markdown) {
          setMarkdown(json.content);
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
    <div className={`markdown-body ${styles.wrapper}`}>
      <Markdown
        components={{
          a: ({ href, children }) => (
            <a href={href as string} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
        }}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
      >
        {markdown}
      </Markdown>
    </div>
  );
};
