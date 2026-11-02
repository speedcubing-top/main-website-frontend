import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { NoteNode, encodeNotePath } from '../utils/NoteServerSideProps';

interface NoteTreeProps {
  nodes: NoteNode[];
  file: string;
}

interface NoteSidebarProps extends NoteTreeProps {
  collapsed: boolean;
  onCollapse: () => void;
  onResize: (width: number) => void;
  onResetWidth: () => void;
}

interface NoteTreeListProps extends NoteTreeProps {
  depth: number;
  openPaths: Set<string>;
  onToggle: (path: string) => void;
}

interface NoteTreeItemProps extends Omit<NoteTreeListProps, 'nodes'> {
  node: NoteNode;
}

// Matches HackMD's book sidebar: 14px on a 20px line, 36px rows, notes 400 and folders 500.
const rowClass = 'block w-full box-border font-[family-name:var(--font-inter),_sans-serif] py-[8px] pr-[8px] rounded-[4px] border-0 text-left text-[14px] leading-[20px] no-underline truncate cursor-pointer';

function getFolderPaths(nodes: NoteNode[]): string[] {
  return nodes.flatMap((node) => (
    node.children === null ? [] : [node.path, ...getFolderPaths(node.children)]
  ));
}

function getParentPaths(file: string): string[] {
  const parts = file.split('/').slice(1, -1);
  return parts.map((_, i) => `/${parts.slice(0, i + 1).join('/')}`);
}

const NoteTreeItem: React.FC<NoteTreeItemProps> = ({ node, file, depth, openPaths, onToggle }) => {
  const paddingLeft = 8 + depth * 24;

  if (node.children === null) {
    const active = file === node.path;
    return (
      <li>
        <Link
          className={`${rowClass} font-normal ${active ? 'bg-[#2a2a2a] text-[white]' : 'text-[#c9d1d9] hover:bg-[#1f1f1f]'}`}
          style={{ paddingLeft }}
          href={`/notes${node.slug ? `/${node.slug}` : encodeNotePath(node.path)}`}
          title={node.name}
          aria-current={active ? 'page' : undefined}
        >
          {node.name}
        </Link>
      </li>
    );
  }

  const open = openPaths.has(node.path);

  return (
    <li>
      <button
        className={`${rowClass} font-medium bg-transparent text-[#c9d1d9] hover:bg-[#1f1f1f]`}
        style={{ paddingLeft }}
        type="button"
        title={node.name}
        aria-expanded={open}
        onClick={() => onToggle(node.path)}
      >
        <svg
          className={`inline-block mr-[6px] align-[-1px] text-[#8b949e] transition-transform duration-100 ${open ? 'rotate-90' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4.5 2.5 8 6l-3.5 3.5" />
        </svg>
        {node.name}/
      </button>
      {open && (
        <div className="relative">
          <span
            className="absolute top-0 bottom-0 w-[1px] bg-[#30363d] pointer-events-none"
            style={{ left: paddingLeft + 6 }}
            aria-hidden="true"
          />
          <NoteTreeList nodes={node.children} file={file} depth={depth + 1} openPaths={openPaths} onToggle={onToggle} />
        </div>
      )}
    </li>
  );
};

const NoteTreeList: React.FC<NoteTreeListProps> = ({ nodes, file, depth, openPaths, onToggle }) => (
  <ul className="m-0 p-0 list-none">
    {nodes.map((node) => (
      <NoteTreeItem key={node.path} node={node} file={file} depth={depth} openPaths={openPaths} onToggle={onToggle} />
    ))}
  </ul>
);

const NoteTree: React.FC<NoteSidebarProps> = ({ nodes, file, collapsed, onCollapse, onResize, onResetWidth }) => {
  const folderPaths = useMemo(() => getFolderPaths(nodes), [nodes]);
  const [openPaths, setOpenPaths] = useState<Set<string>>(() => new Set(getParentPaths(file)));
  const allOpen = folderPaths.every((path) => openPaths.has(path));

  useEffect(() => {
    setOpenPaths((paths) => new Set(Array.from(paths).concat(getParentPaths(file))));
  }, [file]);

  const togglePath = (path: string) => {
    setOpenPaths((paths) => {
      const next = new Set(paths);
      if (!next.delete(path)) {
        next.add(path);
      }
      return next;
    });
  };

  return (
    <aside className={`relative min-w-0 box-border [border-right:1px_solid_#2a2a2a] ${collapsed ? 'hidden' : ''}`}>
      <nav className="sticky top-[40px] max-h-[calc(100vh-40px)] box-border p-[12px] overflow-y-auto [color-scheme:dark]">
        <div className="flex items-center mb-[8px]">
          {folderPaths.length > 0 && (
            <button
              className="p-0 border-0 bg-transparent font-[family-name:var(--font-inter),_sans-serif] tracking-[0.35px] text-[12px] text-[#8b949e] cursor-pointer hover:text-[white]"
              type="button"
              onClick={() => setOpenPaths(new Set(allOpen ? [] : folderPaths))}
            >
              {allOpen ? 'Collapse all' : 'Expand all'}
            </button>
          )}
          <button
            className="ml-auto p-0 border-0 bg-transparent font-sans text-[16px] leading-none text-[#8b949e] cursor-pointer hover:text-[white]"
            type="button"
            title="Hide sidebar"
            aria-label="Hide sidebar"
            onClick={onCollapse}
          >
            «
          </button>
        </div>
        <NoteTreeList nodes={nodes} file={file} depth={0} openPaths={openPaths} onToggle={togglePath} />
      </nav>
      <div
        className="absolute top-0 bottom-0 right-[-3px] z-[1] w-[6px] cursor-col-resize touch-none hover:bg-[#30363d]"
        role="separator"
        aria-orientation="vertical"
        title="Drag to resize, double-click to reset"
        onPointerDown={(event) => {
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            onResize(event.clientX);
          }
        }}
        onDoubleClick={onResetWidth}
      />
    </aside>
  );
};

export default NoteTree;
