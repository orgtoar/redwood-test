/* eslint-env node */

/**
 * - if failure, comment on pr. checkbox?
 */

import { exec, getExecOutput } from '@actions/exec'
import { context } from '@actions/github'
import boxen from 'boxen'

const styles = {
  borderStyle: 'round',
  float: 'left',
  padding: { top: 0, right: 1, bottom: 0, left: 1 },
}

/**
 * @param {string} message
 */
function logSuccess(message) {
  console.log(boxen(message, { ...styles, title: `✅ Ok` }))
}

// If a PR changes a file in one of these directories, the fixture may need to be rebuilt.
const sensitivePaths = /** @type {const} */ ([
  // yarn rw g
  'packages/cli/src/commands/generate',

  // yarn rw setup
  'packages/cli/src/commands/setup',

  // Used in various CLI commands
  'packages/cli-helpers/src/',

  // yarn create redwood-app
  'packages/create-redwood-app/template',

  // yarn rw setup auth
  'packages/auth-providers/dbAuth/setup',
])

async function run() {
  // ------------------------
  // If the PR has the "fixture-ok" label, just pass
  const { labels } = context.payload.pull_request
  const hasFixtureOkLabel = labels.some((label) => label.name === 'fixture-ok')

  console.log({ labels, hasFixtureOkLabel })
  console.log()

  if (hasFixtureOkLabel) {
    logSuccess('This PR has the "fixture-ok" label')
    return
  }

  // ------------------------
  // Check if the PR rebuilds the fixture
  await exec('git fetch origin main')
  console.log()

  const { stdout } = (
    await getExecOutput('git diff origin/main --name-only')
  )
  console.log()

  const changedFiles = stdout
    .trim()
    .split('\n')
    .filter(Boolean)

  const rebuiltFixture = changedFiles.some((file) =>
    file.startsWith('__fixtures__/test-project')
  )

  if (rebuiltFixture) {
    logSuccess('This PR rebuilt the test project fixture')
    return
  }

  // ------------------------
  // If it doesn't, does it need to be rebuilt?
  const shouldRebuildFixture = changedFiles.some((file) =>
    sensitivePaths.some((path) => file.startsWith(path))
  )

  if (!shouldRebuildFixture) {
    logSuccess("The test project fixture doesn't need to be rebuilt")
    return
  }

  console.log(
    boxen(
      [
        'This PR changes files that could affect the test project fixture.',
        `It may need to be rebuilt. But if you know that it doesn't, add the "fixture-ok" label.`,
        'Otherwise, rebuild the test project fixture (this may take a while), commit the changes, and push:',
        '',
        '  yarn build:test-project --rebuild-fixture',
        '',
      ].join('\n'),
      {
        ...styles,
        title: '👋 Heads up',
      }
    )
  )

  process.exitCode = 1
}

run()
