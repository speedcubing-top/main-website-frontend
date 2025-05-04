import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import React, { useEffect, useState } from 'react';
import Error404 from '../errorpage/Error404';
import './markdown.css';

interface LinkRendererProps {
  href: string;
  children: React.ReactNode;
}

function LinkRenderer({ href, children }: LinkRendererProps) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

interface RenderFileProps {
  file: string;
}

export function renderMarkdown(markdown: string): JSX.Element {
  return (
    <Markdown
      components={{ a: LinkRenderer }}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
    >
      {markdown}
    </Markdown>
  );
}

export function RenderFile({ file }: RenderFileProps): JSX.Element {
  const [found, setFound] = useState<boolean>(true);
  const [markdown, setMarkdown] = useState<string>('');

  useEffect(() => {
    const run = async () => {
      const res = await fetch('https://speedcubing.top/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file }),
      });

      const json = await res.json();
      if (json.success) {
        setMarkdown(json.content);
      } else {
        setFound(false);
      }
    };
    run();

    const intervalId = setInterval(run, 5000);
    return () => clearInterval(intervalId);
  }, [file]);

  if (!found) {
    return <Error404 />;
  }

  return (
    <div className="flex-[1] bg-[#101010]">
      <div className="markdown-body">{renderMarkdown(markdown)}</div>
    </div>
  );
}
