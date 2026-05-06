import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['lib/**', 'hooks/**', 'components/**'],
      exclude: ['components/ui/use-toast.ts', 'components/ui/use-mobile.tsx'],
      thresholds: {
        statements: 20,
        branches: 15,
        functions: 20,
        lines: 20,
      },
      reporter: ['text', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
