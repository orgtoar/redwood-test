import type { PlaywrightTestConfig } from '@playwright/test'
import { devices } from '@playwright/test'

// See https://playwright.dev/docs/test-configuration#global-configuration
export const basePlaywrightConfig: PlaywrightTestConfig = {
  // 30 seconds is th default.
  timeout: 30_000,

  expect: {
    // Maximum time expect() should wait for the condition to be met.
    // 5 seconds is the default.
    timeout: 5_000 * 2,
  },

  testDir: './tests',

  // Run tests in files in parallel.
  // fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only.
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : undefined,

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Concise 'dot' for CI, default 'list' when running locally
  reporter: process.env.CI ? 'dot' : 'list',
}
