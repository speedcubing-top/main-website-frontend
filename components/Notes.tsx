import React from 'react';
import { renderMarkdown } from '../utils/markdownUtils';

interface NotesProps {
  content: string;
}

const Notes: React.FC<NotesProps> = ({ content }: NotesProps) => {
  return (
    <div className="flex-1 bg-[#101010]">
      {renderMarkdown(content)}
    </div>
  );
};

export default Notes;
