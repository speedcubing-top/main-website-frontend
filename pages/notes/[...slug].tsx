import Notes from '../../components/Notes';
import { getNoteServerSideProps } from '../../utils/NoteServerSideProps';

interface NotesPageProps {
  content: string;
  file: string;
}

export default function NotesPage({ content, file }: NotesPageProps) {
  return <Notes content={content} file={file} />;
}

export async function getServerSideProps(context: any) {
  const { slug } = context.params;
  const file = Array.isArray(slug) ? `/${slug.join('/')}` : '/notes';
  return getNoteServerSideProps(file);
}
