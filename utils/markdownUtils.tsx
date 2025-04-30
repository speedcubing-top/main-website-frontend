import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import React from 'react';

import 'highlight.js/styles/github-dark.css';
import 'github-markdown-css/github-markdown-dark.css';

import styles from './markdown.module.css'

export function renderMarkdown(markdown: string) {
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
}