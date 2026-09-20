import { Text, Stack, Group, Box } from '@mantine/core';
import { useOutletContext } from 'react-router-dom';

export default function Grading() {
  const { course } = useOutletContext();
  return (
    <Stack gap="xs">
      <Text fz={14} fw={600} mb={4}>
        Grading policy
      </Text>

      <Group gap={0} h={10} wrap="nowrap" style={{ borderRadius: 6, overflow: 'hidden' }} mb="sm">
        {course.grading.map((g) => (
          <Box key={g.label} bg={g.color} style={{ width: `${g.percent}%`, height: '100%' }} />
        ))}
      </Group>

      <Group gap="md" wrap="wrap">
        {course.grading.map((g) => (
          <Group key={g.label} gap={6}>
            <Box w={8} h={8} bg={g.color} style={{ borderRadius: 2 }} />
            <Text fz={12}>
              {g.label}, {g.percent}%
            </Text>
          </Group>
        ))}
      </Group>
    </Stack>
  );
}
