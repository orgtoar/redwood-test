import type { PlaywrightTestConfig } from '@playwright/test'
import { devices } from '@playwright/test'
import { devices as replayDevices } from '@replayio/playwright'

// https://playwright.dev/docs/test-reporters#dot-reporter
// https://playwright.dev/docs/test-reporters#html-reporter
// Use the Replay.io reporter in CI for debugging.
// let reporter = process.env.PLAYWRIGHT_REPORTER

reporter ??= 'list'

if (process.env.CI) {
  // The Dot reporter is very concise - it only produces a single character per successful test run.
  // It is the default on CI and useful where you don't want a lot of output.
  reporter = 'dot'
}

console.log({
  reporter,
})

// See https://playwright.dev/docs/test-configuration#global-configuration
export const basePlaywrightConfig: PlaywrightTestConfig = {
  testDir: './tests',

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

    {
      name: 'replay-chromium',
      use: { ...(replayDevices['Replay Chromium'] as any) },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'replay-firefox',
    //   use: { ...(replayDevices['Replay Firefox'] as any) },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  reporter,
}
