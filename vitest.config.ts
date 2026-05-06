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
        statements: 70,
        branches: 60,
        functions: 62,
        lines: 70,
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
