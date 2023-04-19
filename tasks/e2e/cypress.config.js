const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    excludeSpecPattern: ['**/codemods/*.js', '**/sharedTests.js'],
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    supportFile: false,
    testIsolation: false,
    setupNodeEvents(on, _config) {
      on('task', {
        log(message) {
          console.log(message + '\n\n')
          return null
        },
      })
    },
  },
  // `runMode` is for `cypress run`, `openMode` is for `cypress open`.
  // Locally, we use open. But in CI, we use run.
  retries: {
    runMode: 5,
    openMode: 0,
  },

  defaultCommandTimeout: 12_0000,
  execTimeout: 12_0000,
  pageLoadTimeout: 12_0000,
  requestTimeout: 12_0000,
  taskTimeout: 12_0000,

  video: false,
  screenshotOnRunFailure: false,
})
