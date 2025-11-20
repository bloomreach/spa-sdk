/*
 * Copyright 2019-2025 Bloomreach
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable import/no-extraneous-dependencies */
import babel from '@rollup/plugin-babel';
import dts from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import terserOptions from './terser.json';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'dist',
        entryFileNames: '[name].umd.js',
        exports: 'named',
        format: 'umd',
        name: 'BloomreachReactSdk',
        sourcemap: true,
        sourcemapExcludeSources: true,
        inlineDynamicImports: true,
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@bloomreach/spa-sdk': 'BloomreachSpaSdk',
        },
      },
    ],
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
    plugins: [
      typescript({ clean: true }),
      babel({ babelHelpers: 'bundled', extensions: ['.ts'] }),
      terser(terserOptions),
    ],
  },

  // Server build (RSC compatible)
  {
    input: 'src/index.server.ts',
    output: [
      {
        dir: 'dist',
        entryFileNames: '[name].js',
        format: 'es',
        sourcemap: true,
      },
    ],
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
    plugins: [typescript({ clean: true }), terser(terserOptions)],
  },

  // Client build (with hooks, browser APIs, etc.)
  {
    input: 'src/index.client.ts',
    output: [
      {
        dir: 'dist',
        entryFileNames: '[name].js',
        format: 'es',
        sourcemap: true,
        banner: "'use client';",
      },
    ],
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
    plugins: [typescript({ clean: false }), terser(terserOptions)],
  },

  // keep for backward compatibility
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'dist',
        entryFileNames: '[name].js',
        format: 'es',
        sourcemap: true,
        banner: "'use client';",
      },
    ],
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
    plugins: [typescript({ clean: false }), terser(terserOptions)],
  },

  // Type definitions for server
  {
    input: 'src/index.server.ts',
    output: [
      {
        dir: 'dist',
        entryFileNames: '[name].d.ts',
        format: 'es',
      },
    ],
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
    plugins: [dts()],
  },

  // Type definitions for client
  {
    input: 'src/index.client.ts',
    output: [
      {
        dir: 'dist',
        entryFileNames: '[name].d.ts',
        format: 'es',
      },
    ],
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
    plugins: [dts()],
  },

  // keep for backward compatibility
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'dist',
        entryFileNames: '[name].d.ts',
        format: 'es',
      },
    ],
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
    plugins: [dts()],
  },
];
