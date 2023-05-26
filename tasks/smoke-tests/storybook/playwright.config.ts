import { defineConfig } from '@playwright/test'

import { basePlaywrightConfig } from '../basePlaywright.config'

// See https://playwright.dev/docs/test-configuration#global-configuration
export default defineConfig({
  ...basePlaywrightConfig,

  use: {
    baseURL: 'http://localhost:7910',
  },

  // Run your local dev server before starting the tests
  webServer: {
    command: 'yarn redwood storybook --ci --no-open',
    cwd: process.env.REDWOOD_PROJECT_PATH,
    url: 'http://localhost:7910',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
  },
})
