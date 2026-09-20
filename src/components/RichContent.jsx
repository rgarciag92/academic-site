import { Text, List, Code, Anchor } from '@mantine/core';

// Matches, in priority order: `code`, [text](url), **bold**, ++underline++, *italic*
const INLINE_PATTERN = /`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\+\+([^+]+)\+\+|\*([^*]+)\*/g;

// Parses one level of markup, recursing into each match's captured text so markers can
// combine, e.g. **++text++** is bold and underlined, *++text++* is italic and underlined.
// keyRef is a shared mutable counter so keys stay unique across recursive calls.
function parseInline(text, keyRef) {
  const nodes = [];
  let lastIndex = 0;
  let match;

  // A fresh regex instance per call: INLINE_PATTERN's lastIndex is shared global state,
  // and recursive calls (for nested markup) would clobber the outer call's scan position.
  const pattern = new RegExp(INLINE_PATTERN.source, INLINE_PATTERN.flags);
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const [full, code, linkText, linkUrl, bold, underline, italic] = match;
    if (code !== undefined) {
      // Code spans are literal: their contents are never re-parsed for markup.
      nodes.push(<Code key={keyRef.k++}>{code}</Code>);
    } else if (linkText !== undefined) {
      nodes.push(
        <Anchor key={keyRef.k++} href={linkUrl} fz={14} target="_blank" underline="hover">
          {parseInline(linkText, keyRef)}
        </Anchor>
      );
    } else if (bold !== undefined) {
      nodes.push(
        <Text key={keyRef.k++} fw={800} fz={14} component="strong">
          {parseInline(bold, keyRef)}
        </Text>
      );
    } else if (underline !== undefined) {
      nodes.push(<u key={keyRef.k++}>{parseInline(underline, keyRef)}</u>);
    } else if (italic !== undefined) {
      nodes.push(<em key={keyRef.k++}>{parseInline(italic, keyRef)}</em>);
    }

    lastIndex = match.index + full.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

// Parses inline markup inside a single string: **bold**, ++underline++, *italic*, `code`, [text](url).
// Markers can combine, e.g. **++text++** or *++text++*. Use it anywhere a siteConfig string may
// contain that markup, e.g. <Text><RichText>{data.description}</RichText></Text>
export function RichText({ children }) {
  if (!children) return null;
  return parseInline(children, { k: 0 });
}

// Renders a siteConfig array field that mixes bullet items and standalone paragraphs.
// Accepts:
//   - a plain string item -> rendered as a bullet in the current list
//   - { list: ['...', '...'] } -> its own bullet list
//   - { paragraph: '...' } -> a standalone paragraph, not bulleted
//   - { code: '...' } -> a standalone preformatted block, not bulleted, markup not parsed
// Plain arrays of strings (the existing siteConfig shape) keep working unchanged as a single bullet list.
export function ContentBlocks({ blocks, listProps, textProps }) {
  if (!blocks) return null;

  const items = Array.isArray(blocks) ? blocks : [blocks];
  const nodes = [];
  let pendingList = [];

  const flushList = (key) => {
    if (pendingList.length === 0) return;
    nodes.push(
      <List key={`list-${key}`} {...listProps}>
        {pendingList.map((item, i) => (
          <List.Item key={i}>
            <RichText>{item}</RichText>
          </List.Item>
        ))}
      </List>
    );
    pendingList = [];
  };

  items.forEach((item, idx) => {
    if (typeof item === 'string') {
      pendingList.push(item);
      return;
    }

    if (item.list) {
      flushList(idx);
      nodes.push(
        <List key={`sublist-${idx}`} {...listProps}>
          {item.list.map((sub, i) => (
            <List.Item key={i}>
              <RichText>{sub}</RichText>
            </List.Item>
          ))}
        </List>
      );
      return;
    }

    if (item.paragraph !== undefined) {
      flushList(idx);
      nodes.push(
        <Text key={`p-${idx}`} {...textProps}>
          <RichText>{item.paragraph}</RichText>
        </Text>
      );
      return;
    }

    if (item.code !== undefined) {
      flushList(idx);
      nodes.push(
        <Code key={`code-${idx}`} block color="#ced4da" c="black">
          {item.code}
        </Code>
      );
    }
  });

  flushList('end');

  return nodes;
}
