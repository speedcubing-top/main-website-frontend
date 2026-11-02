import React, { useEffect, useRef, useState } from 'react';
import Loading from './Loading';
import NoteList from './NoteList';
import NoteToc from './NoteToc';
import NoteTree from './NoteTree';
import { NoteNode } from '../utils/NoteServerSideProps';
import { NoteHeading, RenderMarkdown } from '../utils/markdownUtils';
import { isNotesUrl, useNavigatingTo } from '../utils/useNavigation';

interface NotesProps {
  content?: string;
  file: string;
  path?: string;
  title?: string;
  birth?: string | null;
  modified?: string | null;
  tree?: NoteNode[];
}

const SIDEBAR_STORAGE_KEY = 'notes-sidebar';
const DEFAULT_SIDEBAR_WIDTH = 240;
const MIN_SIDEBAR_WIDTH = 180;
const MAX_SIDEBAR_WIDTH = 600;

function clampSidebarWidth(width: number) {
  return Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, width));
}

function readSidebar() {
  const sidebar = { width: DEFAULT_SIDEBAR_WIDTH, collapsed: false };
  try {
    const saved = JSON.parse(localStorage.getItem(SIDEBAR_STORAGE_KEY) ?? '{}');
    if (typeof saved.width === 'number') {
      sidebar.width = clampSidebarWidth(saved.width);
    }
    sidebar.collapsed = saved.collapsed === true;
  } catch (err) {
    // Fall back to the defaults when storage is blocked or holds bad data.
  }
  return sidebar;
}

const Notes: React.FC<NotesProps> = ({ content, file, path, title, birth, modified, tree }) => {
  const [sidebar, setSidebar] = useState({ width: DEFAULT_SIDEBAR_WIDTH, collapsed: false });
  const sidebarLoaded = useRef(false);
  const sidebarWidth = sidebar.collapsed ? 0 : sidebar.width;
  const [headings, setHeadings] = useState<NoteHeading[]>([]);
  // Between notes the sidebar stays and only the note shows Loading; Layout covers every other navigation.
  const navigatingTo = useNavigatingTo();
  const loadingNote = tree !== undefined && navigatingTo !== null && isNotesUrl(navigatingTo);

  useEffect(() => {
    // Storage only exists in the browser, so it's read after hydration.
    if (!sidebarLoaded.current) {
      sidebarLoaded.current = true;
      setSidebar(readSidebar());
      return;
    }

    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(sidebar));
    } catch (err) {
      // Not remembering the sidebar is fine.
    }
  }, [sidebar]);

  return (
    <div
      className={`flex-1 bg-[#101010] ${tree ? 'grid' : 'flex'}`}
      style={tree && {
        // The right column mirrors the sidebar so notes stay centered on the page.
        gridTemplateColumns: `${sidebarWidth}px minmax(min(768px, calc(100vw - ${sidebarWidth}px)), 1fr) minmax(0, ${sidebarWidth}px)`,
      }}
    >
      {tree && (
        <NoteTree
          nodes={tree}
          file={path ?? file}
          collapsed={sidebar.collapsed}
          onCollapse={() => setSidebar({ ...sidebar, collapsed: true })}
          onResize={(width) => setSidebar({ ...sidebar, width: clampSidebarWidth(width) })}
          onResetWidth={() => setSidebar({ ...sidebar, width: DEFAULT_SIDEBAR_WIDTH })}
        />
      )}
      {tree && sidebar.collapsed && (
        <button
          className="fixed top-[52px] left-[12px] z-[5] p-0 border-0 bg-transparent font-sans text-[16px] leading-none text-[#8b949e] cursor-pointer hover:text-[white]"
          type="button"
          title="Show sidebar"
          aria-label="Show sidebar"
          onClick={() => setSidebar({ ...sidebar, collapsed: false })}
        >
          »
        </button>
      )}
      <div className={`flex-1 min-w-0 ${tree ? 'col-start-2 box-border px-[24px]' : ''}`}>
        {loadingNote ? (
          <Loading key={navigatingTo ?? undefined} url={navigatingTo ?? undefined} />
        ) : content === undefined ? (
          <NoteList tree={tree ?? []} />
        ) : (
          <RenderMarkdown
            key={file}
            content={content}
            file={file}
            title={title ?? ''}
            birth={birth}
            modified={modified}
            showDates={tree !== undefined}
            onHeadings={setHeadings}
          />
        )}
      </div>
      {tree && !loadingNote && content !== undefined && headings.length > 1 && <NoteToc headings={headings} />}
    </div>
  );
};


export default Notes;
