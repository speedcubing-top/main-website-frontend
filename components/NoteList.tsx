import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { NoteNode, encodeNotePath } from '../utils/NoteServerSideProps';
import styles from '../utils/markdown.module.css';

interface NoteListProps {
  tree: NoteNode[];
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?$/;

function getNotes(nodes: NoteNode[]): NoteNode[] {
  return nodes.flatMap((node) => (node.children === null ? [node] : getNotes(node.children)));
}

function byTitle(a: NoteNode, b: NoteNode) {
  return a.name.localeCompare(b.name);
}

function byDateDesc(a: NoteNode, b: NoteNode) {
  return (b.date as string).localeCompare(a.date as string) || byTitle(a, b);
}

function groupByYear(notes: NoteNode[]) {
  const years = new Map<string, NoteNode[]>();
  notes.forEach((note) => {
    const year = (note.date as string).slice(0, 4);
    years.set(year, [...(years.get(year) ?? []), note]);
  });
  return Array.from(years);
}

const NoteRow: React.FC<{ note: NoteNode; dated: boolean }> = ({ note, dated }) => {
  const folder = note.path.slice(1, note.path.lastIndexOf('/') + 1);

  return (
    <div className="flex items-baseline gap-[12px] py-[4px]">
      {dated && <span className="shrink-0 w-[48px] text-[14px] text-[#8b949e] tabular-nums">{note.date?.slice(5, 10)}</span>}
      <Link className="min-w-0 truncate" href={`/notes${note.slug ? `/${note.slug}` : encodeNotePath(note.path)}`} title={note.name}>
        {note.name}
      </Link>
      <span className="shrink-0 max-w-[40%] truncate text-[13px] text-[#6e7681]">{folder}</span>
    </div>
  );
};

const NoteList: React.FC<NoteListProps> = ({ tree }) => {
  const notes = getNotes(tree);
  const dated = notes.filter((note) => DATE_PATTERN.test(note.date ?? '')).sort(byDateDesc);
  const undated = notes.filter((note) => !dated.includes(note)).sort(byTitle);

  return (
    <>
      <Head>
        <title>Notes</title>
      </Head>
      <div className={`markdown-body ${styles.wrapper}`}>
        {groupByYear(dated).map(([year, yearNotes]) => (
          <section key={year}>
            <h2>{year}</h2>
            {yearNotes.map((note) => <NoteRow key={note.path} note={note} dated />)}
          </section>
        ))}
        {undated.length > 0 && (
          <section>
            <h2>Undated</h2>
            {undated.map((note) => <NoteRow key={note.path} note={note} dated={false} />)}
          </section>
        )}
      </div>
    </>
  );
};

export default NoteList;
