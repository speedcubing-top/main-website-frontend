import React from 'react';
import Notes from '../components/Notes';
import { getNoteServerSideProps } from '../utils/NoteServerSideProps';

interface NotesPageProps {
  content: string;
  filePath: string;
}

export default function NotesPage({ content, filePath }: NotesPageProps) {
  return <Notes content={content} filePath={filePath} />;
}

export async function getServerSideProps(context: any) {
  return getNoteServerSideProps('');
}
