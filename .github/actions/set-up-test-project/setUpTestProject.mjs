import os from 'node:os'
import path from 'node:path'
import fs from 'fs-extra'

import { fileURLToPath } from 'node:url'
import { exec, getExecOutput } from '@actions/exec'
import * as core from '@actions/core'

const REDWOOD_FRAMEWORK_PATH = fileURLToPath(new URL('../../../', import.meta.url))
const TEST_PROJECT_FIXTURE_PATH = path.join(
  REDWOOD_FRAMEWORK_PATH,
  '__fixtures__',
  'test-project'
)
const REDWOOD_PROJECT_PATH = path.join(
  os.tmpdir(),
  'test-project',
  // ":" is problematic with paths
  new Date().toISOString().split(':').join('-')
)

console.log({
  REDWOOD_PROJECT_PATH
})

core.setOutput('TEST_PROJECT_PATH', REDWOOD_PROJECT_PATH)

console.log(`Creating project at ${REDWOOD_PROJECT_PATH}`)
await fs.copy(TEST_PROJECT_FIXTURE_PATH, REDWOOD_PROJECT_PATH)
console.log()

console.log(`Adding framework dependencies to ${REDWOOD_PROJECT_PATH}`)
await exec('yarn project:deps', null, { env: { RWJS_CWD: REDWOOD_PROJECT_PATH } })
console.log()

console.log(`Installing node_modules in ${REDWOOD_PROJECT_PATH}`)
await exec('yarn install', null, { cwd: REDWOOD_PROJECT_PATH })

console.log('Copying framework packages to project')
await exec('yarn project:copy', null, { env: { RWJS_CWD: REDWOOD_PROJECT_PATH } })
console.log()

console.log('Generating dbAuth secret')
const { stdout } = await getExecOutput('yarn rw g secret --raw', null, { cwd: REDWOOD_PROJECT_PATH })
fs.appendFileSync(
  path.join(REDWOOD_PROJECT_PATH, '.env'),
  `SESSION_SECRET='${stdout}'`
)

console.log('Running prisma migrate reset')
await exec('yarn rw prisma migrate reset --force', null, { cwd: REDWOOD_PROJECT_PATH })
