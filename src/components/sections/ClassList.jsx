import { Text, Paper, Group, Stack, Divider, Badge } from '@mantine/core';
import { Link, useOutletContext } from 'react-router-dom';
import { IconChevronRight } from '@tabler/icons-react';

export default function ClassList() {
  const { course } = useOutletContext();
  const classes = course.classes ?? [];

  return (
    <Stack gap="xs">
      <Text fz={14} fw={600} mb={4}>
        Clases
      </Text>
      <Paper withBorder radius="md">
        {classes.map((c, i) => (
          <div key={c.id}>
            <Group
              component={Link}
              to={`/clases/${c.id}`}
              px="sm"
              py={10}
              justify="space-between"
              wrap="wrap"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Group gap={8}>
                <Badge size="sm" variant="light" color="blue">
                  Clase {c.number}
                </Badge>
                <Text fz={13}>{c.title}</Text>
              </Group>
              <Group gap={8}>
                <Text fz={12} c="dimmed">
                  {c.date}
                </Text>
                <IconChevronRight size={14} />
              </Group>
            </Group>
            {i < classes.length - 1 && <Divider />}
          </div>
        ))}
      </Paper>
    </Stack>
  );
}
