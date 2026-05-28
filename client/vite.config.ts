import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    proxy: {
      '/api': 'http://localhost:80',
      '/assets': 'http://localhost:80',
      '/uploads': 'http://localhost:80',
    },
  },
});
