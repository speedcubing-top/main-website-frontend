const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (mod, filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, filename);
const { readMarkdownStream } = require('../utils/readMarkdownStream.ts');
const encoder = new TextEncoder();
const tick = () => new Promise(resolve => setImmediate(resolve));

function controlledStream() {
  let source;
  const stream = new ReadableStream({ start(controller) { source = controller; } });
  return { stream, enqueue: text => source.enqueue(encoder.encode(text)), close: () => source.close() };
}

test('shows the first paragraph before download completes, keeping a partial image hidden', async () => {
  const source = controlledStream();
  const previews = [];
  const task = readMarkdownStream(new Response(source.stream), raw => previews.push(raw), new AbortController().signal);
  source.enqueue('# First paragraph\n\n![photo](data:image/png;base64,AAAA');
  await tick();
  assert.deepEqual(previews, ['# First paragraph\n\n']);
  source.enqueue('BBBB)\n\nLast paragraph');
  source.close();
  assert.equal(await task, '# First paragraph\n\n![photo](data:image/png;base64,AAAABBBB)\n\nLast paragraph');
});

test('preserves UTF-8 when Chinese characters cross network chunks', async () => {
  const raw = '---\ntitle: 測試\n---\n\n中文與圖片 😀\n\n結尾';
  const bytes = encoder.encode(raw);
  const stream = new ReadableStream({ start(controller) {
    for (const byte of bytes) controller.enqueue(Uint8Array.of(byte));
    controller.close();
  } });
  assert.equal(await readMarkdownStream(new Response(stream), () => {}, new AbortController().signal), raw);
});

test('recognizes CRLF paragraph boundaries split across chunks', async () => {
  const source = controlledStream();
  const previews = [];
  const task = readMarkdownStream(new Response(source.stream), raw => previews.push(raw), new AbortController().signal);
  source.enqueue('First\r\n\r');
  await tick();
  assert.deepEqual(previews, []);
  source.enqueue('\nSecond');
  await tick();
  assert.deepEqual(previews, ['First\r\n\r\n']);
  source.close();
  assert.equal(await task, 'First\r\n\r\nSecond');
});

test('does not expose unfinished front matter', async () => {
  const source = controlledStream();
  const previews = [];
  const task = readMarkdownStream(new Response(source.stream), raw => previews.push(raw), new AbortController().signal);
  source.enqueue('---\ntitle: Test\n\n');
  await tick();
  assert.deepEqual(previews, []);
  source.enqueue('date: 2026-11-05\n---\n\nFirst\n\nMore');
  await tick();
  assert.equal(previews.length, 1);
  assert.ok(previews[0].endsWith('First\n\n'));
  source.close();
  await task;
});

test('unmount aborts a pending read and cancels the stream', async () => {
  let cancelled = false;
  const stream = new ReadableStream({ cancel() { cancelled = true; } });
  const controller = new AbortController();
  const task = readMarkdownStream(new Response(stream), () => {}, controller.signal);
  controller.abort();
  await assert.rejects(task, { name: 'AbortError' });
  assert.equal(cancelled, true);
});

test('network failures reject instead of treating a partial document as complete', async () => {
  const stream = new ReadableStream({ start(controller) { controller.error(new Error('connection lost')); } });
  await assert.rejects(readMarkdownStream(new Response(stream), () => {}, new AbortController().signal), /connection lost/);
});

test('an already-aborted request cancels the unread stream', async () => {
  let cancelled = false;
  const stream = new ReadableStream({ cancel() { cancelled = true; } });
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(readMarkdownStream(new Response(stream), () => {}, controller.signal), { name: 'AbortError' });
  assert.equal(cancelled, true);
});
