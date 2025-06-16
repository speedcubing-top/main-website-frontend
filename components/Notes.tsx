import React from 'react';
import { RenderMarkdown } from '../utils/markdownUtils';

interface NotesProps {
  content: string;
  filePath: string;
}

const Notes: React.FC<NotesProps> = ({ content, filePath }) => {
  return (
    <div className="flex-1 bg-[#101010]">
      <RenderMarkdown content={content} filePath={filePath} />
    </div>
  );
};


export default Notes;
