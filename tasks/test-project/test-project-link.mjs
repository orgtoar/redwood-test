#!/usr/bin/env node
/* eslint-env node */
// @ts-check

// Force zx to output color unless the user specified otherwise.
process.env.FORCE_COLOR ??= '3'

import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

import { cd, chalk, fs, os, path, within, $ } from 'zx'

const separator = chalk.gray('-'.repeat(process.stdout.columns))

const REDWOOD_FRAMEWORK_PATH = fileURLToPath(new URL('../../', import.meta.url))
const TEST_PROJECT_FIXTURE_PATH = path.join(
  REDWOOD_FRAMEWORK_PATH,
  '__fixtures__',
  'test-project'
)
/** @type {string} */
let REDWOOD_PROJECT_PATH

async function main() {
  // Parse args.
  const {
    positionals,
    values: { ci },
  } = parseArgs({
    options: {
      ci: {
        type: 'boolean',
        default: false,
      },
    },
    allowPositionals: true,
  })

  if (positionals.length === 0) {
    REDWOOD_PROJECT_PATH = path.join(
      os.tmpdir(),
      'test-project',
      // ':' is problematic with paths.
      new Date().toISOString().split(':').join('-')
    )
  } else {
    REDWOOD_PROJECT_PATH = path.resolve(positionals[0])

    // Check that REDWOOD_PROJECT_PATH isn't in REDWOOD_FRAMEWORK_PATH.
    const relative = path.relative(REDWOOD_FRAMEWORK_PATH, REDWOOD_PROJECT_PATH)

    if (!relative.startsWith('..') && !path.isAbsolute(relative)) {
      throw new Error(
        'REDWOOD_PROJECT_PATH must be outside REDWOOD_FRAMEWORK_PATH'
      )
    }
  }

  process.env.RWJS_CWD = REDWOOD_PROJECT_PATH

  if (ci) {
    await $`echo "TEST_PROJECT_PATH=${REDWOOD_PROJECT_PATH}" >> $GITHUB_OUTPUT`
    console.log()
  }

  // ------------------------
  console.log(
    [
      separator,
      `Creating project at ${chalk.magenta(REDWOOD_PROJECT_PATH)}`,
    ].join('\n')
  )

  await fs.copy(TEST_PROJECT_FIXTURE_PATH, REDWOOD_PROJECT_PATH)
  console.log()

  // ------------------------
  console.log(
    [
      separator,
      `Adding framework dependencies to ${chalk.magenta(REDWOOD_PROJECT_PATH)}`,
      '',
    ].join('\n')
  )

  await $`yarn project:deps`
  console.log()

  // ------------------------
  console.log(
    [
      separator,
      `Installing node_modules in ${chalk.magenta(REDWOOD_PROJECT_PATH)}`,
      '',
    ].join('\n')
  )

  await within(async () => {
    cd(REDWOOD_PROJECT_PATH)
    await $`yarn install`
  })
  console.log()

  // ------------------------
  console.log(
    [separator, 'Copying framework packages to project', ''].join('\n')
  )

  await $`yarn project:copy`
  console.log()

  // ------------------------
  console.log([separator, 'Generating dbAuth secret', ''].join('\n'))

  await within(async () => {
    $.verbose = false

    cd(REDWOOD_PROJECT_PATH)

    const { stdout } = await $`yarn rw g secret --raw`

    fs.appendFileSync(
      path.join(REDWOOD_PROJECT_PATH, '.env'),
      `SESSION_SECRET='${stdout}'`
    )
  })

  // ------------------------
  console.log([separator, 'Running prisma migrate reset', ''].join('\n'))

  await within(async () => {
    cd(REDWOOD_PROJECT_PATH)
    await $`yarn rw prisma migrate reset --force`
  })
}

main()
