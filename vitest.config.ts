import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    clearMocks: true,
    restoreMocks: true,
    unstubGlobals: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/types/**', 'src/**/*.d.ts'],
      reporter: [['text', { skipFull: false, maxCols: 140 }], 'text-summary', 'html', 'json-summary', 'lcov'],
      reportsDirectory: './coverage',
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80, perFile: true },
    },
  },
});
