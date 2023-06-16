import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'es2019',
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'iife'],
      name: 'SwipeCalendar',
    },
    minify: false,
  },
});
