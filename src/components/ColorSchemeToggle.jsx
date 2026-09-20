import { ActionIcon, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';

export default function ColorSchemeToggle(props) {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');

  const toggle = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ActionIcon
      onClick={toggle}
      variant="default"
      size="lg"
      radius="md"
      aria-label="Toggle color scheme"
      {...props}
    >
      {computedColorScheme === 'dark' ? <IconSun size={18} stroke={1.6} /> : <IconMoon size={18} stroke={1.6} />}
    </ActionIcon>
  );
}
