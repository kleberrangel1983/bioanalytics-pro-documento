export default [
  {
    files: ['**/*.{js,cjs,mjs}'],
    ignores: ['node_modules/**', '.next/**'],
    rules: {
      'no-unused-vars': 'error',
    },
  },
]
