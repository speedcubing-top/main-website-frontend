/** Read UTF-8 incrementally, exposing only complete paragraphs while downloading. */
export async function readMarkdownStream(
  response: Response,
  onPreview: (raw: string) => void,
  signal: AbortSignal,
): Promise<string> {
  if (!response.body) return response.text();
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let raw = '';
  let tail = '';
  let boundary = 0;
  let published = 0;
  let lastPublishedAt = -Infinity;
  const abort = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener('abort', abort, { once: true });
  try {
    while (true) {
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
      const { done, value } = await reader.read();
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      const window = tail + text;
      const offset = raw.length - tail.length;
      const lf = window.lastIndexOf('\n\n');
      const crlf = window.lastIndexOf('\r\n\r\n');
      if (lf >= 0) boundary = Math.max(boundary, offset + lf + 2);
      if (crlf >= 0) boundary = Math.max(boundary, offset + crlf + 4);
      raw += text;
      tail = window.slice(-3);
      if (boundary > published && performance.now() - lastPublishedAt >= 150) {
        const preview = raw.slice(0, boundary);
        // Do not show incomplete YAML front matter as article text.
        if (!/^---\r?\n/.test(preview) || /\r?\n---(?:\r?\n|$)/.test(preview)) {
          onPreview(preview);
          published = boundary;
          lastPublishedAt = performance.now();
        }
      }
    }
    return raw + decoder.decode();
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally {
    signal.removeEventListener('abort', abort);
    reader.releaseLock();
  }
}
