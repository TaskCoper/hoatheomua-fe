import { defineConfig, devices } from '@playwright/test'

try {
  process.loadEnvFile()
} catch {
  // no .env file - fall back to whatever the shell provides
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: process.env.E2E_BASE_URL,

    /*
     * Keep the trace for any failure. `on-first-retry` produced nothing locally, because
     * `retries` is 0 outside CI - so a five-minute spec failed with a stack trace and no
     * timeline, DOM snapshot or network log, and the only way to see one was to run it
     * again. See https://playwright.dev/docs/trace-viewer
     */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    /*
     * Video is the most expensive artifact and the trace already embeds DOM snapshots, a
     * screenshot timeline, network and console. It earns its keep only on a CI retry, where
     * it separates a flake from a deterministic failure.
     */
    video: process.env.CI ? 'on-first-retry' : 'off'
  },

  /* Configure projects for major browsers */
  projects: [
    /* Signs in once and saves the session to playwright/.auth/user.json. */
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup']
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup']
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup']
    }
    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ]

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
})
