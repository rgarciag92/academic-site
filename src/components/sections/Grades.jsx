import { Text, Stack, Card } from '@mantine/core';
import { useOutletContext } from 'react-router-dom';
import { ContentBlocks } from '../RichContent';

export default function Grades() {
  const { course } = useOutletContext();
  const { grades } = course;

  return (
    <Stack gap="xs">
      <Card shadow="sm" padding="lg" withBorder>
        <Text fz={16} fw={600} id="reglamentos" data-overview-anchor>
          Calificaciones del Curso
        </Text>
        <Text fz={14} pt={4}>
        <ContentBlocks
          blocks={grades.details}
          listProps={{ fz: 14, pt: 4, spacing: 4 }}
          textProps={{ fz: 14, pt: 4 }}
        />
        </Text>
      </Card>
    </Stack>
  );
}
