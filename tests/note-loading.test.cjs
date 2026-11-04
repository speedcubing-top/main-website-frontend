const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const ts = require('typescript');

require.extensions['.tsx'] = (mod, filename) => {
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  mod._compile(result.outputText, filename);
};
require.extensions['.ts'] = require.extensions['.tsx'];
require.extensions['.css'] = mod => { mod.exports = {}; };
const { getNoteServerSideProps, getNoteTreeServerSideProps } = require('../utils/NoteServerSideProps.tsx');
const response = (json, status = 200) => ({ ok: status === 200, status, json: async () => json });
const originalFetch = global.fetch;
test.afterEach(() => { global.fetch = originalFetch; });

test('small notes use the loading page; missing notes and slug redirects are preserved', async () => {
  global.fetch = async () => response({ content: '---\ntitle: Small note\n---\nHello', path: '/small' });
  const result = await getNoteServerSideProps('/small');
  assert.equal(result.props.content, '');
  assert.equal(result.props.title, 'Small note');
  global.fetch = async () => response(null, 404);
  assert.deepEqual(await getNoteServerSideProps('/missing'), { notFound: true });
  global.fetch = async () => response({ slug: 'canonical' });
  assert.equal((await getNoteServerSideProps('/old')).redirect.destination, '/notes/canonical');
});

test('13 MB embedded-image note produces a small loading page with metadata', async () => {
  const content = '---\ntitle: Large note\n---\n# Heading\n![photo](data:image/jpeg;base64,' + 'A'.repeat(13_000_000) + ')';
  global.fetch = async () => response({ content, path: '/large' });
  const result = await getNoteServerSideProps('/large');
  assert.equal(result.props.content, '');
  assert.equal(result.props.title, 'Large note');
  assert.ok(JSON.stringify(result).length < 4096);
});

function untilAborted(signal) {
  return new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  });
}

test('slow note and tree headers fall back together within the page deadline', async () => {
  global.fetch = async (_url, { signal }) => untilAborted(signal);
  const started = performance.now();
  const result = await getNoteTreeServerSideProps('/slow');
  assert.deepEqual(result.props.tree, []);
  assert.ok(performance.now() - started < 3000);
});

test('deadline also covers a stalled response body', async () => {
  global.fetch = async (_url, { signal }) => ({ ok: true, status: 200, json: () => untilAborted(signal) });
  const started = performance.now();
  assert.equal((await getNoteServerSideProps('/slow-body')).props.content, '');
  assert.ok(performance.now() - started < 3000);
});

test('temporary upstream errors return a retryable loading page', async () => {
  global.fetch = async () => response(null, 504);
  assert.equal((await getNoteServerSideProps('/retry')).props.content, '');
});

test('every Markdown document renders an English loading status on the server', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const { RenderMarkdown } = require('../utils/markdownUtils.tsx');
  const html = renderToStaticMarkup(React.createElement(RenderMarkdown, {
    content: '', file: '/large', title: 'Large note',
  }));
  assert.match(html, /role="status"/);
  assert.match(html, /Loading document/);
});
