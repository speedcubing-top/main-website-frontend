import Markdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import './markdown.css';


export function renderMarkdown(markdown) {
    return (
        <Markdown 
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
        >
          {markdown}
        </Markdown>
    )
}