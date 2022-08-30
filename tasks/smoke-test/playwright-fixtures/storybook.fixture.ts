/* eslint-disable no-empty-pattern */
import { test as base } from '@playwright/test'
import execa from 'execa'
import isPortReachable from 'is-port-reachable'

import { waitForServer } from '../util'

// Declare worker fixtures.
export type StorybookFixture = {
  port: number
  server: string
}

// Note that we did not provide an test-scoped fixtures, so we pass {}.
const test = base.extend<any, StorybookFixture>({
  port: [
    async ({}, use) => {
      await use(7980)
    },
    { scope: 'worker' },
  ],

  // "server" fixture starts automatically for every worker - we pass "auto" for that.
  server: [
    async ({ port }, use) => {
      console.log('Starting storybook server.....')

      const projectPath = process.env.PROJECT_PATH

      if (!projectPath) {
        throw new Error(
          'PROJECT_PATH env var not defined. Please build a test project, and re-run with PROJECT_PATH defined'
        )
      }

      console.log(`Running rw storybook at ${projectPath}`)

      const isServerAlreadyUp = await isPortReachable(port, {
        timeout: 5000,
      })

      if (isServerAlreadyUp) {
        console.log('Reusing existing SB server....')
        console.log({
          port,
        })
      } else {
        // Don't wait for this to finish, because it doens't
        execa(`yarn rw storybook`, ['--port', port, '--no-open', '--ci'], {
          cwd: projectPath,
          shell: true,
          cleanup: true,
          detached: false,
          // For some reason we need to do this. Otherwise the server doesn't launch correctly
          stdio: 'ignore',
        })

        await waitForServer(port, 1_000)
      }

      console.log('Starting tests!')
      await use(`Server ready at ${port}`)
    },
    { scope: 'worker', auto: true },
  ],
})

export default test
