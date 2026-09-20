import { Text, Stack, Card, Badge, Group, Anchor } from '@mantine/core';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { IconChevronLeft } from '@tabler/icons-react';
import { RichText, ContentBlocks } from '../RichContent';

export default function ClassDetail() {
  const { course } = useOutletContext();
  const { classId } = useParams();
  const classes = course.classes ?? [];
  const item = classes.find((c) => c.id === classId);

  if (!item) {
    return (
      <Stack gap="xs">
        <Text fz={14}>No se encontró esa clase.</Text>
        <Anchor component={Link} to="/clases" fz={13}>
          Volver a Clases
        </Anchor>
      </Stack>
    );
  }

  return (
    <Stack gap="xs">
      <Anchor component={Link} to="/clases" fz={13} underline="hover" c="dimmed">
        <Group gap={4}>
          <IconChevronLeft size={14} />
          Clases
        </Group>
      </Anchor>

      <Card shadow="sm" padding="lg" withBorder>
        <Group justify="space-between" align="baseline" wrap="wrap" mb={4}>
          <Text fz={16} fw={600}>
            {item.title}
          </Text>
          <Badge size="sm" variant="light" color="blue">
            Clase {item.number}
          </Badge>
        </Group>
        <Text fz={12} c="dimmed" mb={16}>
          {item.date}
        </Text>

        <Text fz={14} fw={600}>
          Objetivo
        </Text>
        <Text fz={14} pt={4}>
          <RichText>{item.objective}</RichText>
        </Text>

        <Text fz={14} fw={600} pt={20}>
          Material de clase
        </Text>
        <ContentBlocks
          blocks={item.material}
          listProps={{ fz: 14, pt: 4, spacing: 4 }}
          textProps={{ fz: 14, pt: 4 }}
        />

        <Text fz={14} fw={600} pt={20}>
          Actividad
        </Text>
        <ContentBlocks
          blocks={item.activity}
          listProps={{ fz: 14, pt: 4, spacing: 4 }}
          textProps={{ fz: 14, pt: 4 }}
        />
      { item.homework &&   
        (<>
        <Text fz={14} fw={600} pt={20}>
          Tarea
        </Text>
        <ContentBlocks
          blocks={item.homework}
          listProps={{ fz: 14, pt: 4, spacing: 4 }}
          textProps={{ fz: 14, pt: 4 }}
        />
        </>)}
      </Card>
    </Stack>
  );
}
