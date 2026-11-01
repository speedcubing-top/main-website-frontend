import React from 'react';
import NoteTree from './NoteTree';
import { NoteNode } from '../utils/NoteServerSideProps';
import { RenderMarkdown } from '../utils/markdownUtils';

interface NotesProps {
  content: string;
  file: string;
  title: string;
  birth?: string | null;
  modified?: string | null;
  tree?: NoteNode[];
}

const Notes: React.FC<NotesProps> = ({ content, file, title, birth, modified, tree }) => {
  return (
    <div className={`flex-1 bg-[#101010] ${tree ? 'grid grid-cols-[240px_minmax(720px,1fr)_minmax(0,240px)]' : 'flex'}`}>
      {tree && <NoteTree nodes={tree} file={file} />}
      <div className="flex-1 min-w-0">
        <RenderMarkdown
          key={file}
          content={content}
          file={file}
          title={title}
          birth={birth}
          modified={modified}
          showDates={tree !== undefined}
        />
      </div>
    </div>
  );
};


export default Notes;
