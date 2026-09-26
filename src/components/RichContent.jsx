import { Text, List, Code, Anchor, Box } from '@mantine/core';

// Heading styles by level: # title, ## subtitle, ### minor heading.
const HEADING_STYLES = {
  1: { fz: 16, fw: 600 },
  2: { fz: 14, fw: 600 },
  3: { fz: 14, fw: 500, c: 'dimmed' },
};

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
//   - { orderedList: ['...', '...'] } -> its own numbered list
//   - { code: '...' } -> a standalone preformatted block, not bulleted, markup not parsed
//   - { heading: '...', level: 1-3, id } -> a title/subtitle, with `id` as its #anchor
//   - { table: [['a', 'b'], ...] } -> rows of cells; the last column takes the remaining width
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

    if (item.list || item.orderedList) {
      flushList(idx);
      nodes.push(
        <List key={`sublist-${idx}`} type={item.orderedList ? 'ordered' : undefined} {...listProps}>
          {(item.list ?? item.orderedList).map((sub, i) => (
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

    if (item.heading !== undefined) {
      flushList(idx);
      nodes.push(
        <Text
          key={`h-${idx}`}
          id={item.id}
          data-overview-anchor
          {...HEADING_STYLES[item.level]}
          pt={idx === 0 ? 0 : item.level === 1 ? 20 : 12}
        >
          <RichText>{item.heading}</RichText>
        </Text>
      );
      return;
    }

    if (item.table) {
      flushList(idx);
      const columns = Math.max(...item.table.map((row) => row.length));
      nodes.push(
        <Box
          key={`table-${idx}`}
          pt={8}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns - 1}, max-content) 1fr`,
            columnGap: 24,
            rowGap: 6,
          }}
        >
          {item.table.flatMap((row, r) =>
            Array.from({ length: columns }, (_, c) => (
              <Text key={`${r}-${c}`} fz={14}>
                <RichText>{row[c] ?? ''}</RichText>
              </Text>
            ))
          )}
        </Box>
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
