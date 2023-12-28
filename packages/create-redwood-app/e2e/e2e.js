#!/usr/bin/env node
/* eslint-env node */

import { cd, fs, os, path, within, $ } from 'zx'

// const cwd = new URL('./', import.meta.url)

const date = (await $`date '+%Y%m%d_%H%M%S'`).stdout.trim()
const crwaTestPath = path.join(os.tmpdir(), `crwa_${date}`)

await fs.mkdir(crwaTestPath)

await $`yarn --cwd ${crwaTestPath} init -2`

const tarballEntry = (await $`yarn build:pack --json`).stdout
  .trim()
  .split('\n')
  .map(JSON.parse)
  .find((entry) => entry.output)

const tarball = path.basename(tarballEntry.output)

await $`mv ${tarball} ${crwaTestPath}`

await within(async () => {
  cd(crwaTestPath)
  await $`yarn add ./${tarball}`

  await $`yarn create-redwood-app --help`

  // await $`yarn create-redwood-app redwood-app -y`
  // # `yarn pack` seems to ignore `.yarnrc.yml`
  // # cp "$SCRIPT_DIR/templates/ts/.yarnrc.yml" "$CRWA_ESM_TESTING_DIR"
})
