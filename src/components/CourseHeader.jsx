import { Group, Box, Text, Avatar, Button, Badge, Paper } from '@mantine/core';
import { IconMail } from '@tabler/icons-react';
import { site } from '../siteConfig';

export default function CourseHeader({ course }) {
  return (
    <Box mb="lg">
      <Group justify="space-between" align="baseline" mb="sm" wrap="wrap">
        <Text fw={600} fz={20}>
          {course.title}
        </Text>
        <Badge variant="light" color="blue">
          {course.term}
        </Badge>
      </Group>

      <Paper withBorder radius="md" p="sm">
        <Group justify="space-between" wrap="wrap" gap="sm">
          <Group gap="sm">
            <Avatar color="blue" radius="xl">
              {site.professor.initials}
            </Avatar>
            <Box>
              <Text fz={13} fw={600}>
                {site.professor.name}
              </Text>
            </Box>
          </Group>
          <Button
            component="a"
            href={`mailto:${site.professor.email}`}
            variant="light"
            size="xs"
            leftSection={<IconMail size={14} />}
          >
            Email
          </Button>
        </Group>
      </Paper>
    </Box>
  );
}
