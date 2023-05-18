import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  format: ['esm'],
  keepNames: true,
  minify: true,
  sourcemap: true,
  target: 'esnext',
});
