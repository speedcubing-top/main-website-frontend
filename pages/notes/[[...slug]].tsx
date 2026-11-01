import Notes from '../../components/Notes';
import { NoteNode, getNoteListServerSideProps, getNoteTreeServerSideProps } from '../../utils/NoteServerSideProps';

interface NotesPageProps {
  content?: string;
  file: string;
  path?: string;
  title?: string;
  birth?: string | null;
  modified?: string | null;
  tree: NoteNode[];
}

export default function NotesPage({ content, file, path, title, birth, modified, tree }: NotesPageProps) {
  return (
    <Notes content={content} file={file} path={path} title={title} birth={birth} modified={modified} tree={tree} />
  );
}

export async function getServerSideProps(context: any) {
  const { slug } = context.params;
  if (!Array.isArray(slug)) {
    return getNoteListServerSideProps();
  }

  return getNoteTreeServerSideProps(`/${slug.join('/')}`);
}
