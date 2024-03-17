import { cd, chalk, within, $ } from 'zx'

import { consoleBoxen } from './lib/consoleHelpers.mjs'
import { prHasLabel } from './lib/pr.mjs'
import { getLines } from './lib/zxHelpers.mjs'

async function checkCreateRedwoodApp() {
  if (prHasLabel('fixture-ok')) {
    consoleBoxen(
      '⏩ Skipping',
      'Skipping check because of the "crwa-ok" label'
    )
    return
  }

  // Normally the "Set up job action" would install and build
  // but we want this step to run as fast as possible, and if the pr has the
  // "crwa-ok" label, we can pass before.
  await installFrameworkDependencies()
  await buildFrameworkPackages()

  const changedFiles = await rebuildTestProjectFixture()
  if (!changedFiles.length) {
    consoleBoxen(
      '✨ No changes needed',
      "The test project fixture doesn't need to be rebuilt"
    )
    return
  }

  consoleBoxen(
    '🏗️ You need to rebuild the test project fixture',
    [
      `Rebuilding the test project fixture caused files to change:`,
      '',
      ...changedFiles.map((file) => `• ${file}`),
      '',
      'Rebuild the test project fixture and commit the changes:',
      '',
      chalk.green('yarn rebuild-test-project-fixture'),
    ].join('\n')
  )
  process.exitCode = 1
}

await checkCreateRedwoodApp()

async function rebuildTestProjectFixture() {
  let lines

  await within(async () => {
    if (!process.env.GITHUB_WORKSPACE) {
      throw new Error('This action can only be run on pull requests')
    }

    cd(process.env.GITHUB_WORKSPACE)
    await $`yarn rebuild-test-project-fixture`.quiet()
    lines = getLines(await $`git status --porcelain`.quiet())
  })

  return lines
}

async function installFrameworkDependencies() {
  await within(async () => {
    cd(getRootDirPath())
    await $`yarn install`.quiet()
  })
}
async function buildFrameworkPackages() {
  await within(async () => {
    cd(getRootDirPath())
    await $`yarn build`.quiet()
  })
}
function getRootDirPath() {
  const rootDirPath = process.env.GITHUB_WORKSPACE

  if (!rootDirPath) {
    throw new Error('This action can only be run on pull requests')
  }

  return rootDirPath
}
