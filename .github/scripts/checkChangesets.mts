import { chalk } from 'zx'
import { prHasChangeset, prHasLabel, getPr } from './lib/pr.mjs'
import { consoleBoxen } from './lib/consoleHelpers.mjs'

async function checkChangesets() {
  if (prHasLabel('changesets-ok')) {
    console.log('Skipping check because of the "changesets-ok" label')
    return
  }

  if (await prHasChangeset()) {
    consoleBoxen(
      '✅ Thank you!',
      'This PR has a changeset'
    )
    return
  }

  const pr = getPr()
  consoleBoxen(
    '📝 Consider adding a changeset',
    [
      'If this is a user-facing PR (a feature or a fix)',
      'it should probably have a changeset.',
      `Run ${chalk.green(`yarn changesets ${pr.number}`)} to create a changeset for this PR.`,
      `If it doesn't need one (it's a chore), you can add the ${chalk.magenta('changesets-ok')} label.`,
    ].join('\n')
  )
  process.exitCode = 1
}

await checkChangesets()
