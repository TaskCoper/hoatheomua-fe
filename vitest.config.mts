import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // mirrors the `@/*` path alias in tsconfig.json. Done by hand rather than with
    // vite-tsconfig-paths so the unit layer needs exactly one dependency.
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url))
    }
  },
  test: {
    // pure functions only - nothing here touches the DOM
    environment: 'node',
    /*
     * Unit tests are `*.test.ts`; Playwright specs are `*.spec.ts`. Vitest's default
     * include matches both, which would hand every e2e spec to the wrong runner, so the
     * split is enforced here rather than left to convention.
     */
    include: ['**/*.test.ts'],
    exclude: ['node_modules/**', '.next/**', 'e2e/**']
  }
})
