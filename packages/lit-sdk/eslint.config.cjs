// @ts-check

const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const importPlugin = require('eslint-plugin-import');
const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
  recommendedConfig: eslint.configs.recommended,
  allConfig: eslint.configs.all,
});

module.exports = tseslint.config(
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        project: ['tsconfig.json'],
        createDefaultProgram: true,
      },
    },
  },
  {
    files: ['**/*.ts'],
    extends: [
      ...compat.extends('eslint-config-airbnb-base'),
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      // @ts-ignore
      ...compat.config(importPlugin.configs.typescript),
    ],
    settings: {
      'import/resolver': {
        'eslint-import-resolver-typescript': true,
        node: {
          extensions: ['.js', '.ts', '.d.ts'],
        },
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error'],
      '@typescript-eslint/no-use-before-define': ['error'],
      '@typescript-eslint/no-shadow': ['error'],
      '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'arrow-body-style': 'off',
      'class-methods-use-this': 'off',
      curly: ['error', 'all'],
      'eol-last': ['error', 'always'],
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'always',
          ts: 'never',
        },
      ],
      'import/prefer-default-export': 'off',
      'lines-between-class-members': [
        'error',
        'always',
        { exceptAfterSingleLine: true },
      ],
      'linebreak-style': ['error', 'unix'],
      'max-classes-per-file': 'off',
      'max-len': ['error', { code: 120 }],
      'no-param-reassign': 'off',
      'no-plusplus': 'off',
      'no-shadow': 'off',
      'no-underscore-dangle': 'off',
      'no-unused-vars': 'off',
      'no-use-before-define': 'off',
      'no-useless-constructor': 'off',
      'no-restricted-syntax': 'off',
      'no-promise-executor-return': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'default-param-last': 'off',
      'prefer-destructuring': [
        'error',
        {
          VariableDeclarator: { array: true, object: true },
          AssignmentExpression: { array: false, object: false },
        },
      ],
    },
  },
  {
    files: ['**/*.spec.ts', '**/__tests__/**/*.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/unbound-method': 'off',
      'import/no-extraneous-dependencies': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
    },
  },
  {
    files: ['*.d.ts'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },
);
