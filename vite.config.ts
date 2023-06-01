import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'iife'],
      name: 'SwipeCalendar',
    },
    minify: false,
    rollupOptions: {
      // external: /^lit/,
    },
  },
  plugins: [
    // babel({
    //   presets: [
    //     [
    //       '@babel/preset-env',
    //       {
    //         modules: false,
    //         targets: { browsers: ['chrome >= 41', 'ios >= 10'] },
    //         useBuiltIns: 'usage',
    //         corejs: '3.30',
    //       },
    //     ],
    //   ],
    // }),
    // getBabelOutputPlugin({
    //   presets: [['@babel/preset-env', {
    //     modules: false,
    //     targets: { browsers: ['chrome >= 41', 'ios >= 10'] },
    //     useBuiltIns: 'usage',
    //     corejs: '3.28',
    //   }]],
    //   allowAllFormats: true
    // })
  ],
});
