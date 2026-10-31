import React from 'react';
import NoteTree from './NoteTree';
import { NoteNode } from '../utils/NoteServerSideProps';
import { RenderMarkdown } from '../utils/markdownUtils';

interface NotesProps {
  content: string;
  file: string;
  title: string;
  tree?: NoteNode[];
}

const Notes: React.FC<NotesProps> = ({ content, file, title, tree }) => {
  return (
    <div className="flex-1 flex bg-[#101010]">
      {tree && <NoteTree nodes={tree} file={file} />}
      <div className="flex-1 min-w-0">
        <RenderMarkdown key={file} content={content} file={file} title={title} />
      </div>
    </div>
  );
};


export default Notes;
