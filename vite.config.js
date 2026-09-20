import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Deployed to GitHub Pages as a project site: https://rgarciag92.github.io/academic-site/
  base: '/academic-site/',
});
