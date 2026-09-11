import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { compression } from 'vite-plugin-compression2';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss(), compression({ algorithms: ['gzip'] })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
