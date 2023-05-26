import { defineConfig } from '@playwright/test'

import { basePlaywrightConfig } from '../basePlaywright.config'

// See https://playwright.dev/docs/test-configuration#global-configuration
export default defineConfig({
  ...basePlaywrightConfig,

  use: {
    baseURL: 'http://localhost:8910',
  },

  // Run your local dev server before starting the tests
  webServer: {
    command: 'yarn redwood dev --no-generate --fwd="--no-open"',
    cwd: process.env.REDWOOD_PROJECT_PATH,
    url: 'http://localhost:8911/graphql?query={redwood{version}}',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
  },
})
