module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    extraFileExtensions: ['.svelte']
  },
  env: {
    browser: true,
    es6: true
  },
  overrides: [
    {
      files: ['*.svelte'],
      processor: 'svelte3/svelte3',
      rules: {
        // For some reason, eslint generates false positives wherever I use svelte-query,
        // even though svelte-query has all the type annotations and they make sense to me.
        // We'll just rely on svelte-check to warn us about `any` values.
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
      },
    }
  ],
  plugins: ['svelte3', '@typescript-eslint'],
  settings: {
    'svelte3/typescript': require('typescript')
    // ignore style tags in Svelte because of Tailwind CSS
    // See https://github.com/sveltejs/eslint-plugin-svelte3/issues/70
    //'svelte3/ignore-styles': () => true
  },
  rules: {
    'linebreak-style': 'off',
  },
  ignorePatterns: ['node_modules']
};
