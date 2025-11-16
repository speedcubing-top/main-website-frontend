import Notes from '../../components/Notes';
import { getNoteServerSideProps } from '../../utils/NoteServerSideProps';

interface NotesPageProps {
  content: string;
  file: string;
  title: string;
}

export default function NotesPage({ content, file, title }: NotesPageProps) {
  return (
    <Notes content={content} file={file} title={title} />
  );
}

export async function getServerSideProps(context: any) {
  const { slug } = context.params;
  const file = Array.isArray(slug) ? `/${slug.join('/')}` : '/notes';

  return getNoteServerSideProps(file);
}
