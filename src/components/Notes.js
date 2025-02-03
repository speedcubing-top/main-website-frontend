import React, { useEffect, useState } from 'react'
import Error404 from '../errorpage/Error404'
import { renderMarkdown } from '../utils/markdownUtils'
import './Notes.css'

const Notes = () => {
  
  const [found, setFound] = useState(true);
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    const run = async () => {
      const path = window.location.pathname;

      const extractedFileName = path.substring(6);
      
      const res = await fetch('https://speedcubing.top/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'file': extractedFileName
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
};

export default Notes;
