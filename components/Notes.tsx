import React from 'react';
import { RenderMarkdown } from '../utils/markdownUtils';

interface NotesProps {
  content: string;
  file: string;
  title: string;
}

const Notes: React.FC<NotesProps> = ({ content, file, title}) => {
  return (
    <div className="flex-1 bg-[#101010]">
      <RenderMarkdown content={content} file={file} title={title} />
    </div>
  );
};


export default Notes;
