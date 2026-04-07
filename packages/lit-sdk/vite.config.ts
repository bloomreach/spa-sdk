import { fileURLToPath, URL } from 'node:url';
import { resolve } from 'node:path';
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
      '@bloomreach/spa-sdk': resolve(__dirname, '../spa-sdk/src/index.ts'),
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
