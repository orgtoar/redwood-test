import { consoleBoxen } from './lib/consoleHelpers.mjs'
import {
  prHasLabel,
  prRebuildsCreateRedwoodAppTemplate,
  prShouldRebuildCreateRedwoodAppTemplate,
} from './lib/pr.mjs'

import { chalk } from 'zx'

async function checkCreateRedwoodApp() {
  if (prHasLabel('crwa-ok')) {
    consoleBoxen(
      '⏩ Skipping',
      'Skipping check because of the "crwa-ok" label'
    )
    return
  }

  if (await prRebuildsCreateRedwoodAppTemplate()) {
    consoleBoxen(
      '✅ Thank you!',
      'This PR rebuilds the create-redwood-app JS template'
    )
    return
  }

  if (!await prShouldRebuildCreateRedwoodAppTemplate()) {
    consoleBoxen(
      '✨ No changes needed',
      "The create redwood app JS template doesn't need to be rebuilt"
    )
    return
  }

  consoleBoxen(
    '🏗️ You need to rebuild the create redwood app JS template',
    [
      'This PR changes the create-redwood-app TS template.',
      'That usually means the JS template needs to be rebuilt.',
      `If you know that it doesn't, add the "crwa-ok" label.`,
      'Otherwise, rebuild the JS template and commit the changes:',
      '',
      chalk.green('cd packages/create-redwood-app'),
      chalk.green('yarn ts-to-js'),
    ].join('\n')
  )
  process.exitCode = 1
}

await checkCreateRedwoodApp()
