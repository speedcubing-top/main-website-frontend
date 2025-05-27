import Notes from '../../components/Notes';
import { getNoteServerSideProps } from '../../utils/NoteServerSideProps';

interface NotesPageProps {
  content: string;
}

export default function NotesPage({ content }: NotesPageProps) {
  return <Notes content={content} />;
}

export async function getServerSideProps(context: any) {
  const { slug } = context.params;
  const filePath = Array.isArray(slug) ? `/${slug.join('/')}` : '/notes';
  return getNoteServerSideProps(filePath);
}