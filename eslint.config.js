import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { vitapactPlugin } from './tools/boundaries/boundaries.js';

const TEST_FILES = ['**/*.test.{ts,tsx}', 'e2e/**/*.ts', 'tools/test/**'];
const UI_CODE = ['app/**/*.tsx', 'screens/**/*.tsx', 'shared/**/*.tsx'];

/** RNF-12: visible text comes from translation files, never from JSX literals. */
const NO_LITERAL_TEXT = [
  {
    selector: 'JSXText[value=/\\S/]',
    message: 'Visible text must come from i18n: use t("key") (RNF-12).',
  },
  {
    selector: 'JSXExpressionContainer > Literal[raw=/^[\'"]/]',
    message: 'Visible text must come from i18n: use t("key") (RNF-12).',
  },
  {
    selector: 'JSXExpressionContainer > TemplateLiteral',
    message: 'Visible text must come from i18n: use t("key") with interpolation (RNF-12).',
  },
  {
    selector:
      'JSXAttribute[name.name=/^(aria-label|title|placeholder|alt|label|description)$/] > Literal',
    message: 'Visible or announced text must come from i18n (RNF-12).',
  },
];

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      'src-tauri/target/**',
      'src-tauri/gen/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { vitapact: vitapactPlugin, 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'vitapact/package-boundaries': 'error',
      // RNF-13: short functions with one job, explicit names over comments.
      'max-lines-per-function': ['error', { max: 40, skipBlankLines: true, skipComments: true }],
      complexity: ['error', 10],
      'max-depth': ['error', 3],
      'max-params': ['error', 4],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: UI_CODE,
    ignores: TEST_FILES,
    rules: { 'no-restricted-syntax': ['error', ...NO_LITERAL_TEXT] },
  },
  {
    files: [...TEST_FILES, 'tools/**/fixtures/**'],
    rules: { 'max-lines-per-function': 'off' },
  },
  {
    files: ['tools/**/*.ts', '*.config.{ts,js}'],
    rules: { 'no-console': 'off' },
  },
  {
    files: ['e2e/**/*.ts'],
    ignores: ['e2e/fixtures.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@playwright/test',
              message: "Import test and expect from './fixtures' (network guard, RNF-01).",
            },
          ],
        },
      ],
    },
  },
  prettier,
);
