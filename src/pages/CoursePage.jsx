import { Outlet } from 'react-router-dom';
import { AppShell, Burger, Group, Text, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Sidebar from '../components/Sidebar';
import CourseHeader from '../components/CourseHeader';
import ColorSchemeToggle from '../components/ColorSchemeToggle';
import { site } from '../siteConfig';

export default function CoursePage() {
  const [opened, { toggle, close }] = useDisclosure();
  const { course } = site;

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 220, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text fw={600} fz={14}>
              {course.code}
            </Text>
          </Group>
          <Group gap="sm">
            <Text fz={12} c="dimmed">
              {course.term}
            </Text>
            <ColorSchemeToggle />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm">
        <Sidebar onNavigate={close} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Box maw={720}>
          <CourseHeader course={course} />
          <Outlet context={{ course }} />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
