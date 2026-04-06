const js = require('@eslint/js');
const globals = require('globals');
const jestPlugin = require('eslint-plugin-jest');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  {
    ignores: ['node_modules/**', 'html-report/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      jest: jestPlugin,
    },
    rules: {
      ...jestPlugin.configs['flat/recommended'].rules,
      'jest/expect-expect': [
        'warn',
        {
          assertFunctionNames: [
            'expect',
            'expectJsonResponse',
            'expectJsonSchemaResponse',
            'expectPlainTextResponse',
          ],
        },
      ],
      'jest/no-disabled-tests': 'warn',
      'no-console': 'off',
    },
  },
  prettierConfig,
];
