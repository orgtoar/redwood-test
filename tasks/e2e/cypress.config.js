const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    excludeSpecPattern: ['**/codemods/*.js', '**/sharedTests.js'],
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    supportFile: false,
    testIsolation: false,
  },

  // `runMode` is for `cypress run`, `openMode` is for `cypress open`.
  // Locally, we use open, but in CI, we use run.
  retries: {
    openMode: null,
    runMode: 2,
  },

  defaultCommandTimeout: 4_000 * 3,
  execTimeout: 4_000 * 3,
  pageLoadTimeout: 4_000 * 3,
  requestTimeout: 4_000 * 3,
  taskTimeout: 4_000 * 3,
})
