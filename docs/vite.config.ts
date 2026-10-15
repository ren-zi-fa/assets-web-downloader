import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
// https://vite.dev/config/
export default defineConfig({
  // Project site GitHub Pages: https://ren-zi-fa.github.io/assets-web-downloader/
  base: '/assets-web-downloader/',
  plugins: [react(), tailwindcss(), babel({ presets: [reactCompilerPreset()] })],
});
