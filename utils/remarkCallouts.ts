const CALLOUT_PATTERN = /^\[!(\w+)\][ \t]*([^\n]*)(?:\n|$)/;

const CALLOUT_STYLES: Record<string, string> = {
  note: 'note',
  info: 'note',
  tip: 'tip',
  hint: 'tip',
  success: 'tip',
  important: 'important',
  warning: 'warning',
  caution: 'caution',
  danger: 'caution',
  error: 'caution',
};

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function toCallout(blockquote: any) {
  const paragraph = blockquote.children[0];
  const text = paragraph?.type === 'paragraph' ? paragraph.children[0] : undefined;
  const match = text?.type === 'text' ? text.value.match(CALLOUT_PATTERN) : null;
  if (!match) {
    return;
  }

  const [marker, type, title] = match;
  const style = CALLOUT_STYLES[type.toLowerCase()] ?? 'note';

  text.value = text.value.slice(marker.length);
  if (!text.value) {
    paragraph.children.shift();
  }
  if (paragraph.children.length === 0) {
    blockquote.children.shift();
  }

  blockquote.data = {
    hName: 'div',
    hProperties: { className: ['callout', `callout-${style}`] },
  };
  blockquote.children.unshift({
    type: 'paragraph',
    data: { hName: 'div', hProperties: { className: ['callout-title'] } },
    children: [{ type: 'text', value: title.trim() || capitalize(type) }],
  });
}

function visit(node: any) {
  if (node.type === 'blockquote') {
    toCallout(node);
  }
  node.children?.forEach(visit);
}

export default function remarkCallouts() {
  return visit;
}
