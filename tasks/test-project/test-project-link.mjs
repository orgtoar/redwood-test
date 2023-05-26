#!/usr/bin/env node
/* eslint-env node */
//@ts-check

// Force zx to output color unless the user specified otherwise.
process.env.FORCE_COLOR ??= '3'

import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

import { cd, chalk, fs, path, within, $ } from 'zx'

const separator = chalk.gray('-'.repeat(process.stdout.columns))

const REDWOOD_FRAMEWORK_PATH = fileURLToPath(new URL('../../', import.meta.url))
const TEST_PROJECT_FIXTURE_PATH = path.join(
  REDWOOD_FRAMEWORK_PATH,
  '__fixtures__/test-project'
)

// This script takes one argument, the path to the test project.
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
  throw new Error('Missing positional argument: REDWOOD_PROJECT_PATH')
}

const REDWOOD_PROJECT_PATH = path.resolve(positionals[0])

// Check that REDWOOD_PROJECT_PATH isn't in REDWOOD_FRAMEWORK_PATH.
const relative = path.relative(REDWOOD_FRAMEWORK_PATH, REDWOOD_PROJECT_PATH)

if (!relative.startsWith('..') && !path.isAbsolute(relative)) {
  throw new Error('REDWOOD_PROJECT_PATH must be outside REDWOOD_FRAMEWORK_PATH')
}

if (ci) {
  $.verbose = false
  console.log = () => {}
}

async function main() {
  // ------------------------
  console.log(
    [
      separator,
      `Creating project at ${chalk.magenta(REDWOOD_PROJECT_PATH)}`,
    ].join('\n')
  )

  await fs.copy(TEST_PROJECT_FIXTURE_PATH, REDWOOD_PROJECT_PATH)
  console.log(chalk.green('Created'))
  console.log()

  // ------------------------
  console.log(
    [
      separator,
      `Adding framework dependencies to ${chalk.magenta(
        REDWOOD_PROJECT_PATH
      )}}`,
      '',
    ].join('\n')
  )

  await within(async () => {
    cd(REDWOOD_PROJECT_PATH)
    await $`RWFW_PATH=${REDWOOD_FRAMEWORK_PATH} yarn project:deps`
  })

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
    await $`yarn install `
  })

  // ------------------------
  console.log(
    [separator, 'Copying framework packages to project', ''].join('\n')
  )

  within(async () => {
    cd(REDWOOD_PROJECT_PATH)
    await $`RWFW_PATH=${REDWOOD_FRAMEWORK_PATH} yarn project:copy`
  })

  // ------------------------
  console.log([separator, 'Generating dbAuth secret', ''].join('\n'))

  await within(async () => {
    $.verbose = false

    cd(REDWOOD_PROJECT_PATH)

    const { stdout } = await $`yarn rw g secret --raw`

    fs.appendFileSync(
      path.join(REDWOOD_PROJECT_PATH, '.env'),
      `SESSION_SECRET=${stdout}`
    )
  })

  // ------------------------
  console.log([separator, 'Running prisma migrate reset', ''].join('\n'))

  await within(async () => {
    cd(REDWOOD_PROJECT_PATH)
    await $`yarn rw prisma migrate reset --force`
  })

  // ------------------------
  console.log([separator, 'Done', ''].join('\n'))

  if (ci) {
    process.stdout.write(REDWOOD_PROJECT_PATH)
  }
}

main()
