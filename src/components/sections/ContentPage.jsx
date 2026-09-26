import { Text, Stack, Card, List, Anchor } from '@mantine/core';
import { useOutletContext } from 'react-router-dom';
import { RichText, ContentBlocks } from '../RichContent';

// Renders one sheet-driven page: every row of the sheet's `Pages` tab whose `page` matches
// becomes a card, in sheet order. When the page has 2+ "# " titles, a "Contenido" card
// linking to each of them is added on top.
export default function ContentPage({ page }) {
  const { course } = useOutletContext();
  const cards = course.pages?.[page] ?? [];
  const titles = cards.flat().filter((block) => block.heading !== undefined && block.level === 1);

  return (
    <Stack gap="xs">
      {titles.length >= 2 && (
        <Card shadow="sm" padding="lg" withBorder>
          <Text fz={16} fw={600}>
            Contenido
          </Text>
          <List fz={14} pt={4} spacing={4}>
            {titles.map((title) => (
              <List.Item key={title.id}>
                <Anchor href={`#${title.id}`} underline="hover" fz={14}>
                  <RichText>{title.heading}</RichText>
                </Anchor>
              </List.Item>
            ))}
          </List>
        </Card>
      )}

      {cards.map((blocks, i) => (
        <Card key={i} shadow="sm" padding="lg" withBorder>
          <ContentBlocks
            blocks={blocks}
            listProps={{ fz: 14, pt: 4, spacing: 4 }}
            textProps={{ fz: 14, pt: 4 }}
          />
        </Card>
      ))}
    </Stack>
  );
}
