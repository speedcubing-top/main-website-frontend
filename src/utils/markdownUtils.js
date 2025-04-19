import Markdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import React, { useEffect, useState } from 'react'
import Error404 from '../errorpage/Error404'
import './markdown.css';

function LinkRenderer(props) {
  return (
    <a href={props.href} target="_blank" rel="noreferrer">
      {props.children}
    </a>
  );
}

export function renderMarkdown(markdown) {
    return (
        <Markdown 
          components={{a: LinkRenderer}}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
        >
          {markdown}
        </Markdown>
    )
}

export function renderFile(file) {
  const [found, setFound] = useState(true);
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    const run = async () => {
      
      const res = await fetch('https://speedcubing.top/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'file': file
        })
      })

      const json = await res.json()
      if(json["success"]) {
        setMarkdown(json["content"])  
      } else setFound(false)
    }
    run()

    const intervalId = setInterval(run, 5000);
    return () => clearInterval(intervalId); 
  }, []);

  if(!found) {
    return <Error404 />;
  }

  return (
    <div className="markdowndiv">
      <div className="markdown-body">
        {
          renderMarkdown(markdown)
        }
      </div>
    </div>
  );
}