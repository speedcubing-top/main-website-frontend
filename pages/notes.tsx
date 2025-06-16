import React from 'react';
import Notes from '../components/Notes';
import { getNoteServerSideProps } from '../utils/NoteServerSideProps';

interface NotesPageProps {
  content: string;
  file: string;
}

export default function NotesPage({ content, file }: NotesPageProps) {
  return <Notes content={content} file={file} />;
}

export async function getServerSideProps(context: any) {
  return getNoteServerSideProps('');
}
