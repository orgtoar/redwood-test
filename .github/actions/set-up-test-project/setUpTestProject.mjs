/* eslint-env node */
// @ts-check

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import fs from 'fs-extra'

import * as core from '@actions/core'
import { exec, getExecOutput } from '@actions/exec'

const REDWOOD_FRAMEWORK_PATH = fileURLToPath(new URL('../../../', import.meta.url))
const TEST_PROJECT_FIXTURE_PATH = path.join(
  REDWOOD_FRAMEWORK_PATH,
  '__fixtures__',
  'test-project'
)
const REDWOOD_PROJECT_PATH = core.getInput('test-project-path')

console.log(`Creating project at ${REDWOOD_PROJECT_PATH}`)

await fs.copy(TEST_PROJECT_FIXTURE_PATH, REDWOOD_PROJECT_PATH)
console.log()

console.log(`Adding framework dependencies to ${REDWOOD_PROJECT_PATH}`)
await run('yarn project:deps')
console.log()

console.log(`Installing node_modules in ${REDWOOD_PROJECT_PATH}`)
await run('yarn install', { cwd: REDWOOD_PROJECT_PATH })
console.log()

console.log('Copying framework packages to project')
await run('yarn project:copy')
console.log()

console.log('Generating dbAuth secret')
const { stdout } = await getExecOutput(
  'yarn rw g secret --raw',
  undefined,
  { cwd: REDWOOD_PROJECT_PATH, silent: true }
)
fs.appendFileSync(
  path.join(REDWOOD_PROJECT_PATH, '.env'),
  `SESSION_SECRET='${stdout}'`
)
console.log()

console.log('Running prisma migrate reset')
await run(
  'yarn rw prisma migrate reset --force',
  { cwd: REDWOOD_PROJECT_PATH }
)

function run(command, { cwd = REDWOOD_FRAMEWORK_PATH, env = {} } = {}) {
  return exec(command, undefined, {
    cwd, env: {
      ...process.env,
      RWJS_CWD: REDWOOD_PROJECT_PATH,
      ...env
    }
  })
}
