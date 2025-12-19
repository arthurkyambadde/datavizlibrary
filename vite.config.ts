import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  server: {
    port: 5173,
    open: '/signup.html',
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VizKit',
      formats: ['es', 'cjs'],
      fileName: (format) => `vizkit.${format}.js`,
    },
    rollupOptions: {
      external: [
        'd3-array',
        'd3-axis',
        'd3-scale',
        'd3-shape',
        'd3-time',
        'd3-time-format',
        'd3-zoom',
        'd3-quadtree',
        'd3-ease',
      ],
      output: {
        globals: {
          'd3-array': 'd3',
          'd3-axis': 'd3',
          'd3-scale': 'd3',
          'd3-shape': 'd3',
          'd3-time': 'd3',
          'd3-time-format': 'd3',
          'd3-zoom': 'd3',
          'd3-quadtree': 'd3',
          'd3-ease': 'd3',
        },
      },
    },
  },
});
