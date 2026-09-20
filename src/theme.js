import { createTheme } from '@mantine/core';

// Modern, institutional look: one blue accent, clean sans type,
// slightly rounded surfaces. No serif here -- this is the
// "faculty portal" direction, not the editorial one.
export const theme = createTheme({
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  primaryColor: 'blue',
  defaultRadius: 'md',
});
