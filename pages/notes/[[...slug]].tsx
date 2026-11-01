import Notes from '../../components/Notes';
import { NoteNode, getNoteTreeServerSideProps } from '../../utils/NoteServerSideProps';

interface NotesPageProps {
  content: string;
  file: string;
  title: string;
  birth: string | null;
  modified: string | null;
  tree: NoteNode[];
}

export default function NotesPage({ content, file, title, birth, modified, tree }: NotesPageProps) {
  return (
    <Notes content={content} file={file} title={title} birth={birth} modified={modified} tree={tree} />
  );
}

export async function getServerSideProps(context: any) {
  const { slug } = context.params;
  const file = Array.isArray(slug) ? `/${slug.join('/')}` : '';

  return getNoteTreeServerSideProps(file);
}
