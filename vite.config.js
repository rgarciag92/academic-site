import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // If you deploy to GitHub Pages as a project site (https://<user>.github.io/<repo>/,
  // not a custom domain or a <user>.github.io repo), uncomment and set this to your
  // repo name so built asset URLs resolve correctly:
  // base: '/<repo-name>/',
});
