import React from 'react';
import Notes from '../components/Notes';
import { getNoteServerSideProps } from '../utils/NoteServerSideProps';

interface MainPageProps {
  content: string;
}

export default function MainPage({ content }: MainPageProps) {
  return <Notes content={content} />;
}

export async function getServerSideProps(context: any) {
  return getNoteServerSideProps('/mainpage');
}