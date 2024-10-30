//eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  entry: {
    main: 'src/main.ts',
    pinoTransportModule: 'src/core/pinoTransportModule.ts',
  },
  format: ['esm'],
  keepNames: true,
  minify: true,
  sourcemap: true,
  target: 'esnext',
});
