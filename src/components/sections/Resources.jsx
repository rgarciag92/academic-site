import { Text, Paper, Group, Stack, Divider } from '@mantine/core';
import { IconFileText, IconPresentation, IconBook, IconMessageCircle } from '@tabler/icons-react';
import { useOutletContext } from 'react-router-dom';

const ICONS = {
  file: IconFileText,
  slides: IconPresentation,
  book: IconBook,
  forum: IconMessageCircle,
};

export default function Resources() {
  const { course } = useOutletContext();
  return (
    <Stack gap="xs">
      <Text fz={14} fw={600} mb={4}>
        Course materials &amp; resources
      </Text>
      <Paper withBorder radius="md">
        {course.resources.map((r, i) => {
          const Icon = ICONS[r.icon];
          return (
            <div key={r.label}>
              <Group
                px="sm"
                py={10}
                gap={10}
                component="a"
                href={r.href}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Icon size={16} stroke={1.6} />
                <Text fz={13}>{r.label}</Text>
              </Group>
              {i < course.resources.length - 1 && <Divider />}
            </div>
          );
        })}
      </Paper>
    </Stack>
  );
}
