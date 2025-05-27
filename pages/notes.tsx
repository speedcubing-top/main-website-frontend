import React from 'react';
import Notes from '../components/Notes';
import { getNoteServerSideProps } from '../utils/NoteServerSideProps';

interface NotesPageProps {
  content: string;
}

export default function NotesPage({ content }: NotesPageProps) {
  return <Notes content={content} />;
}

export async function getServerSideProps(context: any) {
  return getNoteServerSideProps('');
}