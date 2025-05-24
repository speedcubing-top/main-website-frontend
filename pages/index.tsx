import React from 'react';
import Notes from '../components/Notes';

interface MainPageProps {
  content: string;
}

export default function MainPage({ content }: MainPageProps) {
  return <Notes content={content} />;
}

export async function getServerSideProps(context: any) {

  const res = await fetch('http://main-website-backend:8080/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file: '/mainpage' }),
  });

  const json = await res.json();

  if (!json.success) {
    return { notFound: true };
  }

  return {
    props: {
      content: json.content,
    },
  };
}