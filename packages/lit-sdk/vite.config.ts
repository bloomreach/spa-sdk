import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      copyDtsFiles: true,
    }),
  ],
  resolve: {
    alias: {
      '@bloomreach/spa-sdk': fileURLToPath(new URL('../spa-sdk/src/index.ts', import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'BrLitSdk',
      fileName: 'index',
    },
    sourcemap: true,
    rollupOptions: {
      external: [
        'lit',
        'lit/decorators.js',
        'lit/directives/unsafe-html.js',
        'lit/static-html.js',
        '@lit/context',
        '@bloomreach/spa-sdk',
      ],
      output: {
        globals: {
          'lit': 'Lit',
          'lit/decorators.js': 'LitDecorators',
          'lit/static-html.js': 'LitStaticHtml',
          'lit/directives/unsafe-html.js': 'LitUnsafeHtml',
          '@lit/context': 'LitContext',
          '@bloomreach/spa-sdk': 'BloomreachSpaSdk',
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
});
