import { exec, getExecOutput } from '@actions/exec'
import * as core from '@actions/core'

await exec('git fetch origin main')

const labels = core.getInput('labels')

console.log({
  labels,
  parsed: JSON.parse(labels)
})

// The "fixture-ok" label overrides this action.
if (!labels.includes('fixture-ok')) {
  // Check if the PR rebuilds the fixture. If it does, that's enough.
  const { stdout } = await getExecOutput('git diff origin/main --name-only')
  const changedFiles = stdout.toString().trim().split('\n').filter(Boolean)
  const didRebuildFixture = changedFiles.some(file => file.startsWith('__fixtures__/test-project'))

  // If it doesn't, does it need to be rebuilt? If not, no problem. Otherwise, throw.
  if (!didRebuildFixture) {
    const shouldRebuildFixture = changedFiles.some(file => file.startsWith('packages/cli/src/commands/generate') ||
      file.startsWith('packages/cli/src/commands/setup'))

    if (shouldRebuildFixture) {
      console.log([
        'This PR changes generate or setup commands',
        'That usually means the test-project fixture needs to be rebuilt',
        `If you know that it doesn't, add the "fixture-ok" label`,
        'Otherwise, rebuild the fixture and commit the changes:',
        '',
        '  yarn test-project --rebuild-fixture',
        ''
      ].join('\n'))

      process.exitCode = 1
    }
  }
}
