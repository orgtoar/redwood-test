import type { PlaywrightTestConfig } from '@playwright/test'
import { devices } from '@playwright/test'
import { devices as replayDevices } from '@replayio/playwright'

// See https://playwright.dev/docs/test-configuration#global-configuration
export const basePlaywrightConfig: PlaywrightTestConfig = {
  testDir: './tests',

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only.
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI. This is important for Replay,
  // see https://docs.replay.io/test-suites/playwright-instructions#3d8a89612e2148a9b1f7eb7ca0cae67f.
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
    //   name: "replay-firefox",
    //   use: { ...replayDevices["Replay Firefox"] as any },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  reporter: [
    ['list'],
    process.env.CI && ['@replayio/playwright/reporter'],
  ].filter(Boolean),
}
