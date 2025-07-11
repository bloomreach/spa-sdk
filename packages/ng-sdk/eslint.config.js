// @ts-check

// Allows us to bring in the recommended core rules from eslint itself
const eslint = require('@eslint/js');

// Allows us to use the typed utility for our config, and to bring in the recommended rules for TypeScript projects from typescript-eslint
const tseslint = require('typescript-eslint');

// Allows us to bring in the recommended rules for Angular projects from angular-eslint
const angular = require('angular-eslint');

const importNewlines = require('eslint-plugin-import-newlines');
const importPlugin = require('eslint-plugin-import');
const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
  recommendedConfig: eslint.configs.recommended,
  allConfig: eslint.configs.all,
});

// Export our config array, which is composed together thanks to the typed utility function from typescript-eslint
module.exports = tseslint.config(
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        project: [
          "tsconfig.json",
          "tsconfig.spec.json"
        ],
        createDefaultProgram: true,
      },
    },
  },
  {
    // Everything in this config object targets our TypeScript files (Components, Directives, Pipes etc)
    files: ['**/*.ts'],
    extends: [
      ...compat.extends('eslint-config-airbnb-base'),
      // Apply the recommended core rules
      eslint.configs.recommended,
      // Apply the recommended TypeScript rules
      ...tseslint.configs.recommended,
      // Optionally apply stylistic rules from typescript-eslint that improve code consistency
      ...tseslint.configs.stylistic,
      // Apply the recommended Angular rules
      ...angular.configs.tsRecommended,
      // @ts-ignore
      ...compat.config(importPlugin.configs.typescript),
    ],
    // Set the custom processor which will allow us to have our inline Component templates extracted
    // and treated as if they are HTML files (and therefore have the .html config below applied to them)
    processor: angular.processInlineTemplates,
    plugins: {
      'import-newlines': importNewlines,
    },
    settings: {
      'import/resolver': {
        'eslint-import-resolver-typescript': true,
        node: {
          extensions: [".js", ".ts", ".d.ts"],
        },
      },
    },
    // Override specific rules for TypeScript files (these will take priority over the extended configs above)
    rules: {
      '@typescript-eslint/no-unused-vars': ['error'],
      '@typescript-eslint/no-use-before-define': ['error'],
      '@typescript-eslint/no-shadow': ['error'],
      'arrow-body-style': 'off',
      'class-methods-use-this': 'off',
      curly: ['error', 'all'],
      'eol-last': ['error', 'always'],
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
      'import-newlines/enforce': [
        'error',
        {
          items: 8,
          'max-len': 120,
        },
      ],
      'import/prefer-default-export': 'off',
      'lines-between-class-members': [
        'error',
        'always',
        {
          exceptAfterSingleLine: true,
        },
      ],
      'linebreak-style': ['error', 'unix'],
      'max-classes-per-file': 'off',
      'max-len': ['error', { code: 120 }],
      'no-continue': 'off',
      'no-param-reassign': 'off',
      'no-plusplus': 'off',
      'no-shadow': 'off',
      'no-underscore-dangle': 'off',
      'no-unused-vars': 'off',
      'no-use-before-define': 'off',
      'no-useless-constructor': 'off',
      'no-void': 'off',
      'object-curly-newline': [
        'error',
        {
          consistent: true,
          multiline: true,
        },
      ],
      'prefer-destructuring': [
        'error',
        {
          VariableDeclarator: {
            array: true,
            object: true,
          },
          AssignmentExpression: {
            array: false,
            object: false,
          },
        },
      ],
      'prefer-promise-reject-errors': 'off',
      'spaced-comment': [
        'error',
        'always',
        {
          exceptions: ['*'],
          markers: ['/', '!'],
        },
      ],
      '@angular-eslint/prefer-standalone': [
        'off'
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'br',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'br',
          style: 'kebab-case',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/unbound-method': 'off',
      'import/no-extraneous-dependencies': 'off',
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
  {
    files: ['*.d.ts'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },
  {
    // Everything in this config object targets our HTML files (external templates,
    // and inline templates as long as we have the `processor` set on our TypeScript config above)
    files: ['**/*.html'],
    extends: [
      // Apply the recommended Angular template rules
      ...angular.configs.templateRecommended,
      // Apply the Angular template rules which focus on accessibility of our apps
      // ...angular.configs.templateAccessibility,
    ],
    rules: {},
  },
);
